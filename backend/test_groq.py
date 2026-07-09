import asyncio
from app.api.chat import chat_intake, ChatIntakeRequest, ChatMessage
import json

async def main():
    req = ChatIntakeRequest(messages=[ChatMessage(role="user", content="Plan a 3 day trip to paris for a couple")])
    result = await chat_intake(req)
    print(json.dumps(result, indent=2))

asyncio.run(main())
