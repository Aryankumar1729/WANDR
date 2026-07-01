"""Test script for end-to-end orchestration for a Lakshadweep trip."""
import requests
import json
import time

payload = {
    "origin": "Kochi",
    "destination": "Lakshadweep",
    "date": "2026-10-15",
    "duration": 3,
    "adults": 2,
    "budget": 80000
}

print(f"🚀 Sending orchestrator request for {payload['destination']} trip...\n")
start_time = time.time()
response = requests.post("http://localhost:8000/api/orchestration/stream", json=payload, stream=True)

success = True
for line in response.iter_lines():
    if line:
        decoded = line.decode('utf-8')
        if decoded.startswith("data: "):
            try:
                data = json.loads(decoded[6:])
                event = data.get("event")
                message = data.get("message", "")
                agent = data.get("agent", "")
                
                if event == "orchestrator_started":
                    print(f"🏁 {message}")
                elif event == "agent_running":
                    print(f"⏳ Running {agent}...")
                elif event == "agent_completed":
                    print(f"✅ {agent} completed!")
                    # Check specific agent results to ensure they aren't totally empty
                    if agent == "ItineraryAgent":
                        days = data.get("result", {}).get("data", {}).get("days", [])
                        print(f"   ↳ Generated {len(days)} days of itinerary.")
                        if len(days) == 0:
                            success = False
                            print("   ❌ ERROR: Itinerary is empty!")
                    elif agent == "FlightAgent":
                        flights = data.get("result", {}).get("data", [])
                        print(f"   ↳ Found {len(flights)} flights.")
                    elif agent == "HotelAgent":
                        hotels = data.get("result", {}).get("data", [])
                        print(f"   ↳ Found {len(hotels)} hotels.")
                    elif agent == "BudgetAgent":
                        status = data.get("result", {}).get("data", {}).get("status", "")
                        total = data.get("result", {}).get("data", {}).get("total_cost", 0)
                        print(f"   ↳ Budget check: {status} (Total: ₹{total})")
                elif event == "orchestrator_error":
                    print(f"❌ ERROR: {message}")
                    success = False
                elif event == "orchestrator_finished":
                    print(f"🏁 {message}")
                else:
                    print(f"ℹ️  {event}: {message}")
            except Exception as e:
                print(f"Error parsing line: {decoded} -> {e}")
                success = False

duration = time.time() - start_time
print(f"\n⏱️ Total orchestration time: {duration:.2f} seconds")
print(f"🎉 TEST {'PASSED' if success else 'FAILED'}")
