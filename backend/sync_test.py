import requests
import json

payload = {
    "origin": "Delhi",
    "destination": "Pune",
    "date": "2026-10-01",
    "duration": 5,
    "adults": 1,
    "budget": 50000
}

response = requests.post("http://localhost:8000/api/orchestration/stream", json=payload, stream=True)
for line in response.iter_lines():
    if line:
        decoded = line.decode('utf-8')
        if decoded.startswith("data: "):
            data = json.loads(decoded[6:])
            if data["event"] == "agent_completed" and data["agent"] == "ItineraryAgent":
                days = data["result"]["data"].get("days", [])
                print(f"Number of days generated: {len(days)}")
                for d in days:
                    print(f"Day {d.get('day')} activities: {len(d.get('activities', []))}")
                break
