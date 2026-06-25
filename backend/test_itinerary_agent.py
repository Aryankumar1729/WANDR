import asyncio
import json
from app.agents.itinerary_agent import ItineraryAgent
from app.agents.base_agent import A2AMessage

async def run_tests():
    agent = ItineraryAgent()

    print("--- Test: Itinerary Generation & Places Enrichment ---")
    msg = A2AMessage("Orchestrator", "ItineraryAgent", {
        "destination": "Mumbai"
    })
    
    res = await agent.process_message(msg)
    print(f"Status: {res['status']}")
    print(f"Message: {res.get('message', 'No error message')}")
    print("Data:")
    print(json.dumps(res['data'], indent=2))

if __name__ == "__main__":
    asyncio.run(run_tests())
