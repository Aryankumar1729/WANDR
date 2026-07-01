"""Test: Verify Wikipedia photos are returned instead of broken Unsplash source URLs."""
import requests
import json

payload = {
    "origin": "Delhi",
    "destination": "Mumbai",
    "date": "2026-10-01",
    "duration": 2,
    "adults": 1,
    "budget": 50000
}

print("🚀 Sending request...")
response = requests.post("http://localhost:8000/api/orchestration/stream", json=payload, stream=True)

for line in response.iter_lines():
    if line:
        decoded = line.decode('utf-8')
        if decoded.startswith("data: "):
            data = json.loads(decoded[6:])
            
            if data["event"] == "agent_completed" and data["agent"] == "ItineraryAgent":
                days = data["result"]["data"].get("days", [])
                print(f"\n✅ Got {len(days)} days\n")
                
                wiki_count = 0
                fallback_count = 0
                broken_count = 0
                
                for d in days:
                    for act in d.get("activities", []):
                        pd = act.get("place_details", {})
                        name = pd.get("name", "?")
                        photo = pd.get("photo_url", "NONE")
                        
                        if "wikipedia" in photo or "wikimedia" in photo:
                            source = "📷 WIKIPEDIA"
                            wiki_count += 1
                        elif "unsplash.com/photo" in photo:
                            source = "🖼️  FALLBACK"
                            fallback_count += 1
                        elif "source.unsplash" in photo:
                            source = "❌ BROKEN"
                            broken_count += 1
                        else:
                            source = f"❓ {photo[:40]}"
                        
                        print(f"  {source}  {name}")
                        
                        # Also check alternatives
                        for alt in act.get("alternatives", []):
                            alt_photo = alt.get("photo_url", "NONE")
                            alt_name = alt.get("name", "?")
                            if "wikipedia" in alt_photo or "wikimedia" in alt_photo:
                                wiki_count += 1
                            elif "unsplash.com/photo" in alt_photo:
                                fallback_count += 1
                            elif "source.unsplash" in alt_photo:
                                broken_count += 1
                
                print(f"\n{'='*50}")
                print(f"  Wikipedia photos:  {wiki_count}")
                print(f"  Fallback photos:   {fallback_count}")
                print(f"  Broken URLs:       {broken_count}")
                print(f"  Status: {'✅ ALL IMAGES WORKING' if broken_count == 0 else '❌ STILL BROKEN'}")
                print(f"{'='*50}")
                break
