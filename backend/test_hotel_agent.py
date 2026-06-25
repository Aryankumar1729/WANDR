import asyncio
from app.agents.hotel_agent import HotelAgent
from app.agents.base_agent import A2AMessage

async def run_tests():
    agent = HotelAgent()

    print("--- Test 1: Real Search ---")
    msg1 = A2AMessage("Orchestrator", "HotelAgent", {
        "destination": "Mumbai",
        "date": "2026-10-01",
        "adults": 1
    })
    res1 = await agent.process_message(msg1)
    print(f"Status: {res1['status']}")
    print(f"Message: {res1['message']}")
    print(f"Data: {res1['data']}")

    print("\n--- Test 2: Bad Search (Past Date) ---")
    msg2 = A2AMessage("Orchestrator", "HotelAgent", {
        "destination": "Mumbai",
        "date": "2022-01-01",
        "adults": 1
    })
    res2 = await agent.process_message(msg2)
    print(f"Status: {res2['status']}")
    print(f"Message: {res2['message']}")

if __name__ == "__main__":
    asyncio.run(run_tests())
