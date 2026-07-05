import asyncio
from app.agents.weather_agent import WeatherAgent
from app.agents.base_agent import A2AMessage

async def main():
    agent = WeatherAgent()
    msg = A2AMessage(sender="orchestrator", receiver="WeatherAgent", payload={"destination": "Mumbai"})
    res = await agent.process_message(msg)
    print(res)

asyncio.run(main())
