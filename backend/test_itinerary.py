import asyncio
from app.agents.itinerary_agent import ItineraryAgent
from app.agents.base_agent import A2AMessage

async def main():
    agent = ItineraryAgent()
    msg = A2AMessage(
        sender="test",
        payload={
            "destination": "Goa",
            "duration": 5,
            "weather": {"data": {"condition": "Sunny", "temp": 30}}
        }
    )
    res = await agent.process_message(msg)
    print(f"Days: {len(res['data']['days'])}")

if __name__ == "__main__":
    asyncio.run(main())
