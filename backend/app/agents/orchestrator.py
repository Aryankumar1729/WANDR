import asyncio
import json
import hashlib
from typing import AsyncGenerator
from app.agents.base_agent import ADKAgent
from app.agents.flight_agent import FlightAgent
from app.agents.hotel_agent import HotelAgent
from app.agents.itinerary_agent import ItineraryAgent
from app.agents.budget_agent import BudgetAgent
from app.agents.weather_agent import WeatherAgent

# In-memory cache for Phase 5 (Key: payload hash, Value: list of SSE messages)
# Note: Caching can cause stale data if the underlying agent logic is updated!
_cache = {}

class OrchestratorAgent(ADKAgent):
    def __init__(self):
        super().__init__("OrchestratorAgent")
        self.flight_agent = FlightAgent()
        self.hotel_agent = HotelAgent()
        self.itinerary_agent = ItineraryAgent()
        self.budget_agent = BudgetAgent()
        self.weather_agent = WeatherAgent()

    def _generate_cache_key(self, request_payload: dict) -> str:
        payload_str = json.dumps(request_payload, sort_keys=True)
        return hashlib.md5(payload_str.encode()).hexdigest()

    async def stream_plan(self, request_payload: dict) -> AsyncGenerator[str, None]:
        yield f"data: {json.dumps({'event': 'orchestrator_started', 'message': 'Starting multi-agent orchestration'})}\n\n"
        
        cache_key = self._generate_cache_key(request_payload)
        
        if cache_key in _cache:
            yield f"data: {json.dumps({'event': 'cache_hit', 'message': 'Serving plan from cache'})}\n\n"
            for step in _cache[cache_key]:
                yield step
                await asyncio.sleep(0.1)
            yield f"data: {json.dumps({'event': 'orchestrator_finished', 'message': 'Orchestration complete'})}\n\n"
            return

        plan_steps = []

        def yield_and_cache(step_data: str):
            plan_steps.append(step_data)
            return step_data

        try:
            # 0. Weather Check (can run first/parallel)
            yield yield_and_cache(f"data: {json.dumps({'event': 'agent_running', 'agent': 'WeatherAgent'})}\n\n")
            weather_result = await self.send_message(self.weather_agent, request_payload)
            yield yield_and_cache(f"data: {json.dumps({'event': 'agent_completed', 'agent': 'WeatherAgent', 'result': weather_result})}\n\n")

            # 1. Flight Search
            yield yield_and_cache(f"data: {json.dumps({'event': 'agent_running', 'agent': 'FlightAgent'})}\n\n")
            flight_result = await self.send_message(self.flight_agent, request_payload)
            yield yield_and_cache(f"data: {json.dumps({'event': 'agent_completed', 'agent': 'FlightAgent', 'result': flight_result})}\n\n")
            
            # 2. Hotel Search
            yield yield_and_cache(f"data: {json.dumps({'event': 'agent_running', 'agent': 'HotelAgent'})}\n\n")
            hotel_result = await self.send_message(self.hotel_agent, request_payload)
            yield yield_and_cache(f"data: {json.dumps({'event': 'agent_completed', 'agent': 'HotelAgent', 'result': hotel_result})}\n\n")
            
            # 3. Itinerary Generation
            yield yield_and_cache(f"data: {json.dumps({'event': 'agent_running', 'agent': 'ItineraryAgent'})}\n\n")
            itinerary_payload = {
                **request_payload, 
                "flights": flight_result, 
                "hotels": hotel_result,
                "weather": weather_result
            }
            itinerary_result = await self.send_message(self.itinerary_agent, itinerary_payload)
            yield yield_and_cache(f"data: {json.dumps({'event': 'agent_completed', 'agent': 'ItineraryAgent', 'result': itinerary_result})}\n\n")
            
            # 4. Budget Check
            yield yield_and_cache(f"data: {json.dumps({'event': 'agent_running', 'agent': 'BudgetAgent'})}\n\n")
            budget_payload = {**itinerary_payload, "itinerary": itinerary_result}
            budget_result = await self.send_message(self.budget_agent, budget_payload)
            yield yield_and_cache(f"data: {json.dumps({'event': 'agent_completed', 'agent': 'BudgetAgent', 'result': budget_result})}\n\n")

            # Store in cache after successful completion
            _cache[cache_key] = plan_steps
            
        except Exception as e:
            yield f"data: {json.dumps({'event': 'orchestrator_error', 'message': str(e)})}\n\n"
        finally:
            yield f"data: {json.dumps({'event': 'orchestrator_finished', 'message': 'Orchestration complete'})}\n\n"
