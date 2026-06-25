import asyncio
import json
from google import genai
from google.genai import types
from app.config import settings
from app.agents.base_agent import ADKAgent, A2AMessage
from app.providers.places_provider import PlacesProvider

class ItineraryAgent(ADKAgent):
    def __init__(self):
        super().__init__("ItineraryAgent")
        self.places_provider = PlacesProvider()
        # Initialize Gemini via ADK / GenAI SDK
        self.gemini_client = genai.Client(api_key=settings.gemini_api_key) if settings.gemini_api_key else None

    async def process_message(self, message: A2AMessage) -> dict:
        payload = message.payload
        destination = payload.get("destination", "Mumbai")

        duration = payload.get("duration", 2)
        weather_data = payload.get("weather", {}).get("data", {})
        weather_condition = weather_data.get("condition", "Unknown")
        temp = weather_data.get("temp", "Unknown")

        if not self.gemini_client:
            return {"status": "error", "agent": self.name, "message": "GEMINI_API_KEY is missing", "data": {}}

        # Generate dynamic schema based on duration to force the LLM to output all days
        days_schema = ",\n".join([f"""                {{
                    "day": {i},
                    "activities": [
                        {{
                            "time": "09:00 AM",
                            "title": "Breakfast/Activity",
                            "type": "MEAL",
                            "search_query": "Popular spot in {destination}"
                        }}
                    ]
                }}""" for i in range(1, duration + 1)])

        # Generate agentic itinerary via Gemini
        prompt = f"""
        You are a highly intelligent travel agent planning a {duration}-day itinerary for {destination}.
        The current weather forecast is {weather_condition} with temperatures around {temp}°C. 
        CRITICAL INSTRUCTIONS:
        1. Adapt the plan to the weather: if it's raining or extremely hot, suggest indoor museums, cafes, or covered markets. If clear, suggest outdoor exploration, sunset walks, etc.
        2. Group activities logically by neighborhood to minimize travel distance and traffic time.
        3. Include specific recommendations for quick local snacks, street food, or highly-rated cafes between major sightseeing spots.
        4. ABSOLUTE REQUIREMENT: You MUST provide exactly {duration} days in the itinerary. The "days" array must have exactly {duration} elements, numbered 1 through {duration}.
        
        Return ONLY a JSON object representing the daily plan.
        Do not include markdown backticks like ```json.
        Schema MUST EXACTLY match this structure for all {duration} days:
        {{
            "days": [
{days_schema}
            ]
        }}
        """
        
        loop = asyncio.get_running_loop()
        def _call_gemini():
            return self.gemini_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    max_output_tokens=8192
                )
            )

        def _call_groq():
            import requests
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "system", "content": "You are a JSON-only API. Output ONLY valid JSON without any markdown formatting, no backticks, no explanations. You MUST output ALL requested array items."}, {"role": "user", "content": prompt}],
                "max_tokens": 6000
            }
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        
        try:
            response = await loop.run_in_executor(None, _call_gemini)
            response_text = response.text
            with open("itinerary_debug.log", "a") as f:
                f.write("GEMINI PROMPT:\n" + prompt + "\nGEMINI RESPONSE:\n" + response_text + "\n\n")
            itinerary_plan = json.loads(response_text)
        except Exception as e:
            # Fallback to Groq
            if settings.groq_api_key:
                try:
                    response_text = await loop.run_in_executor(None, _call_groq)
                    with open("itinerary_debug.log", "a") as f:
                        f.write("GROQ PROMPT:\n" + prompt + "\nGROQ RESPONSE:\n" + response_text + "\n\n")
                    # Strip markdown backticks if present
                    if response_text.startswith("```"):
                        response_text = response_text.split("```")[1]
                        if response_text.startswith("json"):
                            response_text = response_text[4:]
                    response_text = response_text.strip()
                    itinerary_plan = json.loads(response_text)
                except Exception as groq_err:
                    return {"status": "error", "agent": self.name, "message": f"Gemini Error: {e} | Groq Error: {groq_err}", "data": {}}
            else:
                return {"status": "error", "agent": self.name, "message": f"Gemini Error: {e} (Groq API Key missing for fallback)", "data": {}}

        # Enrich with Google Places
        for day in itinerary_plan.get("days", []):
            prev_location = None
            for activity in day.get("activities", []):
                query = activity.get("search_query")
                if query:
                    places = await self.places_provider.search_places(query)
                    if places:
                        top_place = places[0]
                        activity["place_details"] = {
                            "name": top_place.get("displayName", {}).get("text"),
                            "address": top_place.get("formattedAddress"),
                            "rating": top_place.get("rating"),
                            "location": top_place.get("location")
                        }
                        photos = top_place.get("photos", [])
                        if photos:
                            activity["place_details"]["photo_url"] = self.places_provider.get_photo_url(photos[0].get("name"))
                        
                        curr_location = top_place.get("location")
                        if prev_location and curr_location:
                            travel_info = await self.places_provider.get_distance_and_time(
                                prev_location["latitude"], prev_location["longitude"],
                                curr_location["latitude"], curr_location["longitude"]
                            )
                            if travel_info:
                                activity["travel_info"] = travel_info
                        prev_location = curr_location

                        if activity.get("type") == "MEAL":
                            alt_query = f"Highly rated restaurants near {top_place.get('displayName', {}).get('text', destination)}"
                            alt_places = await self.places_provider.search_places(alt_query)
                            alternatives = []
                            for alt in alt_places[1:4]:  # skip the first one as it might be the same
                                alt_data = {
                                    "name": alt.get("displayName", {}).get("text"),
                                    "rating": alt.get("rating")
                                }
                                alt_photos = alt.get("photos", [])
                                if alt_photos:
                                    alt_data["photo_url"] = self.places_provider.get_photo_url(alt_photos[0].get("name"))
                                alternatives.append(alt_data)
                            if alternatives:
                                activity["alternatives"] = alternatives

        return {
            "status": "success",
            "agent": self.name,
            "data": itinerary_plan
        }
