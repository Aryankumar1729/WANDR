import asyncio
import os
from dotenv import load_dotenv
import httpx

load_dotenv()

async def test():
    api_key = os.getenv("SERPAPI_API_KEY")
    params2 = {
        "engine": "google_hotels",
        "q": "Jaipur",
        "check_in_date": "2026-10-01",
        "check_out_date": "2026-10-02",
        "currency": "INR",
        "api_key": api_key
    }
    async with httpx.AsyncClient() as client:
        r = await client.get("https://serpapi.com/search.json", params=params2)
        data = r.json()
        props = data.get("properties", [])
        if props:
            first_hotel = props[0]
            print("Property Token:", first_hotel.get("property_token"))
            print("Name:", first_hotel.get("name"))
            
            # Check if images exist in the initial response
            images = first_hotel.get("images", [])
            print("Images from main API:", len(images))
            if images:
                print("First image:", images[0].get("thumbnail", images[0]))
            
            # test photos api
            token = first_hotel.get("property_token")
            params = {
                "engine": "google_hotels_photos",
                "property_token": token,
                "api_key": api_key
            }
            r2 = await client.get("https://serpapi.com/search.json", params=params)
            if r2.status_code == 200:
                pdata = r2.json()
                sections = pdata.get("sections", [])
                if sections:
                    print("First section:", sections[0])
                else:
                    print("No sections found in response:", pdata.keys())

asyncio.run(test())
