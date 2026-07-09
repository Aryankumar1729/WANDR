import asyncio
import json
from app.agents.itinerary_agent import ItineraryAgent
from app.agents.base_agent import A2AMessage

async def main():
    agent = ItineraryAgent()
    msg = A2AMessage("Orchestrator", "ItineraryAgent", {
        "destination": "Paris",
        "duration": 1,
        "weather": {}
    })
    result = await agent.process_message(msg)
    print(json.dumps(result, indent=2)[:500])

asyncio.run(main())
