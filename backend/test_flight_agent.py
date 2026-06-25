import asyncio
from app.agents.flight_agent import FlightAgent
from app.agents.base_agent import A2AMessage

async def run_tests():
    agent = FlightAgent()

    print("--- Test 1: Real Search ---")
    msg1 = A2AMessage("Orchestrator", "FlightAgent", {
        "origin": "Delhi",
        "destination": "Mumbai",
        "date": "2026-10-01",
        "adults": 1
    })
    res1 = await agent.process_message(msg1)
    print(f"Status: {res1['status']}")
    print(f"Message: {res1['message']}")
    print(f"Data: {res1['data']}")

    print("\n--- Test 2: Bad Search (Past Date) ---")
    msg2 = A2AMessage("Orchestrator", "FlightAgent", {
        "origin": "Delhi",
        "destination": "Mumbai",
        "date": "2022-01-01",
        "adults": 1
    })
    res2 = await agent.process_message(msg2)
    print(f"Status: {res2['status']}")
    print(f"Message: {res2['message']}")

    print("\n--- Test 3: Bad Search (Fake Airport Code) ---")
    msg3 = A2AMessage("Orchestrator", "FlightAgent", {
        "origin": "FAKE",
        "destination": "BOM",
        "date": "2026-10-01",
        "adults": 1
    })
    res3 = await agent.process_message(msg3)
    print(f"Status: {res3['status']}")
    print(f"Message: {res3['message']}")

if __name__ == "__main__":
    asyncio.run(run_tests())
