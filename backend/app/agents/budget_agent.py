import asyncio
from app.agents.base_agent import ADKAgent, A2AMessage

class BudgetAgent(ADKAgent):
    def __init__(self):
        super().__init__("BudgetAgent")

    async def process_message(self, message: A2AMessage) -> dict:
        payload = message.payload
        budget = float(payload.get("budget", 50000.0))
        
        flights = payload.get("flights", {}).get("data", [])
        hotels = payload.get("hotels", {}).get("data", [])

        total_cost = 0.0
        
        if flights:
            try:
                price_str = str(flights[0].get("price", "0")).replace("INR", "").replace("₹", "").replace(",", "").strip()
                total_cost += float(price_str)
            except ValueError:
                pass

        if hotels:
            try:
                price_str = str(hotels[0].get("price", "0")).replace("INR", "").replace("₹", "").replace(",", "").strip()
                total_cost += float(price_str)
            except ValueError:
                pass

        feasible = total_cost <= budget
        remaining = budget - total_cost

        if feasible:
            suggestion = f"Great! Your trip looks feasible. Flights and Hotels will cost approximately ₹{total_cost:,.2f}, leaving ₹{remaining:,.2f} for your daily itinerary and food."
        else:
            suggestion = f"Warning: The current flights and hotels (₹{total_cost:,.2f}) exceed your budget of ₹{budget:,.2f} by ₹{abs(remaining):,.2f}. Consider modifying your dates or selecting cheaper options."

        return {
            "status": "success",
            "agent": self.name,
            "data": {
                "feasible": feasible,
                "total_cost": total_cost,
                "remaining_budget": remaining,
                "suggestion": suggestion
            }
        }
