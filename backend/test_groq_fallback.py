import asyncio
import json
from app.agents.itinerary_agent import ItineraryAgent
from app.agents.base_agent import A2AMessage

async def run_tests():
    agent = ItineraryAgent()
    # Intentionally break Gemini to trigger fallback
    agent.gemini_client = None
    # Wait, the code has: `if not self.gemini_client: return {"status": "error"}`. 
    # Let's mock a bad API call instead of setting client to None.
    
    class FakeGemini:
        class models:
            @staticmethod
            def generate_content(*args, **kwargs):
                raise Exception("Fake Gemini API Outage")
    agent.gemini_client = FakeGemini()

    print("--- Test: Groq Fallback Generation ---")
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
