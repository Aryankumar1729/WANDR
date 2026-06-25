import requests
import json

payload = {
    "origin": "Delhi",
    "destination": "Goa",
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
                print(json.dumps(data["result"]["data"], indent=2))
                break
