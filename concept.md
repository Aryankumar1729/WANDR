# Project Concept: Sarthi — India-First AI Travel Planning Platform

> Working name "Sarthi" (Hindi: guide/charioteer — the one who navigates the journey, not just books the ticket). Rename freely; the architecture doesn't depend on it.

This document is written to be handed to another engineering agent (human or AI) and used directly to scaffold the project. It defines the problem, the competitive gap, the feature set, the agent architecture, the data sources, and the known constraints. Anyone implementing from this doc should be able to derive a backlog without re-deriving the rationale.

---

## 1. One-line pitch

A conversational, multi-agent AI travel planner — in the spirit of Mindtrip/Layla — that is built around how people actually travel in India: trains as the backbone, buses filling the gaps, flights for long haul, and budget/waitlist uncertainty as a first-class planning constraint rather than an afterthought.

---

## 2. The gap, stated plainly

International AI trip planners (Mindtrip, Layla, Stippl, Wonderplan) are itinerary-first: you chat, they generate a day-by-day plan with photos, maps, reviews, and increasingly real pricing, and you organize everything in one place. Mindtrip in particular has built out hotels, flights, restaurants, experiences, group chat planning, collections, and receipt organization as one connected product.

India's dominant travel apps (MakeMyTrip, Goibibo, ixigo, EaseMyTrip, IRCTC Rail Connect) are booking-first, not planning-first. They aggregate flights, trains, buses, and hotels and let you transact, and ixigo layers in genuinely useful predictive features (waitlist confirmation odds, delay prediction). But none of them hold a conversation with you about the trip, reason about your whole itinerary across modes of transport, or treat "will this train ticket confirm" as part of the same planning decision as "should I book a flight instead." MakeMyTrip's strength is breadth of booking categories, not personalized reasoning about your specific trip.

So the gap isn't "no one has AI travel planning" (the category is crowded globally) and it isn't "no one books Indian trains" (IRCTC/MMT/ixigo do that fine). The gap is the intersection: nobody is doing Mindtrip-style conversational, multi-agent itinerary reasoning **with Indian ground-transport realities — train classes, tatkal, waitlists, bus-vs-train-vs-flight tradeoffs, regional/pilgrimage circuits — as native planning inputs instead of a separate booking tab.**

That intersection is also where the genuine ML problem lives: predicting whether a waitlisted or RAC ticket will confirm is a real classification problem on historical PNR data, and it's the one feature area where you'd be building something ixigo has but Mindtrip/Layla don't, which is a much stronger differentiation story than "yet another AI itinerary generator."

---

## 3. Competitive landscape

| Capability | Mindtrip / Layla / Stippl | MakeMyTrip / Goibibo | ixigo | This project |
|---|---|---|---|---|
| Conversational AI itinerary generation | Yes | No | No | Yes |
| Multi-agent reasoning (flights/hotels/itinerary/budget as distinct specialists) | Partial/unclear (proprietary) | No | No | Yes, explicit (ADK + A2A) |
| Indian train booking & classes | No | Yes | Yes | Yes |
| Waitlist/tatkal confirmation prediction | No | Limited | Yes | Yes (own ML model) |
| Cross-modal transit tradeoff (train vs bus vs flight, cost+time+confirmation odds together) | No | No | Partial (flight price only) | Yes |
| Group/collaborative trip planning | Yes (Mindtrip) | No | No | Yes |
| Budget-aware re-planning ("make day 2 cheaper") | Partial | No | No | Yes |
| Regional/pilgrimage/festival-calendar awareness | No | Partial (packages) | No | Yes |
| Hindi/regional language support | No | Partial | Partial | Yes (stretch) |

Honest framing for anyone pitching this: the "AI travel planner" category is saturated worldwide. The defensible claim is narrower and should stay narrow — **India-aware multi-modal itinerary reasoning with a real prediction model for the one uncertainty (waitlist/tatkal) that uniquely matters here.**

---

## 4. Target users

- The budget/backpacker traveler stitching together trains, buses, and hostels across multiple states, for whom "will my ticket confirm" materially changes the plan.
- The pilgrimage/circuit traveler (Char Dham, Golden Temple, Tirupati, Vaishno Devi) who needs season, weather, and crowd-calendar awareness baked into the itinerary, not bolted on.
- The metro professional planning a short multi-city trip who wants Mindtrip-style polish but with Indian transit data that international tools don't have.
- The group/family planner who needs collaborative input but a single coherent plan and budget at the end.

---

## 5. Core features (MVP)

1. **Conversational + structured trip intake** — natural language ("4 days in Himachal under ₹15k, prefer trains") or a structured form; both feed the same orchestrator.
2. **Flight Agent** — real-time flight search and pricing.
3. **Train Agent** — route/class/availability lookup, fare comparison across classes, and the confirmation-probability model for waitlisted/RAC tickets.
4. **Bus Agent** — intercity bus search where trains/flights don't reach or aren't cost-effective.
5. **Multi-Modal Tradeoff Agent** — given the same origin/destination/dates, compares train vs bus vs flight on cost, time, and confirmation risk, and recommends — this is the agent that doesn't exist in any competitor today.
6. **Hotel Agent** — search/pricing by budget tier, locality, and proximity to planned activities.
7. **Itinerary Agent** — sequences points of interest into a sane day-by-day plan, accounting for opening hours, travel time, and (for pilgrimage/seasonal destinations) weather and crowd advisories.
8. **Budget Agent** — aggregates all agent outputs against the user's stated budget, flags overruns, proposes specific swaps.
9. **Live agent activity feed** — streamed view of what each agent is doing, the same demo-and-UX feature discussed for the orchestration story.
10. **Conversational refinement** — targeted replanning ("swap day 2 hotel for something cheaper") that re-triggers only the relevant agent.
11. **Saved trips, trip history, basic auth.**
12. **Map view of the itinerary.**

## 6. Differentiated / stretch features

- **Tatkal/waitlist confirmation prediction model** — the core ML deliverable; trained on historical confirmation patterns (route, class, quota, season, days-to-departure) where data can legally be sourced or synthesized.
- **Festival/season advisory agent** — flags monsoon closures, festival crowding, or off-season discounts for specific circuits.
- **Group voting/collaboration** — shared trip, comments, and a way to reconcile conflicting preferences before finalizing.
- **Regional language support** — Hindi at minimum, given the target user base.
- **Receipt/booking organizer** — Mindtrip-style single place for confirmations, adapted for India's mix of e-tickets, PNRs, and bus operator confirmations.
- **UPI-native payment flow** — table stakes for India, absent from every international competitor.

---

## 7. System architecture

Consistent with the earlier architecture discussion in this build:

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind. Talks to the backend over REST + SSE.
- **Gateway:** FastAPI service owning the ADK Runner/session, exposing REST + SSE to the frontend, handling auth, rate limiting, and caching. This is the seam that keeps the TypeScript frontend decoupled from Python agent internals.
- **Agents (Python, Google ADK, communicating over A2A):** Flight, Train, Bus, Multi-Modal Tradeoff, Hotel, Itinerary, Budget — each its own deployable service with an agent card, orchestrated by a root agent that delegates and merges results.
- **ML service:** the tatkal/waitlist confirmation model is a separate inference service (not an LLM-reasoning agent) called as a tool by the Train Agent — keep it architecturally distinct since it's a trained classifier, not an LLM call.
- **Data:** Postgres for users/trips/history, Redis for caching provider responses and session/progress state.
- **Deployment:** Docker Compose locally; Next.js to Vercel; Python agents/gateway to Cloud Run (the path ADK's own docs point toward).

---

## 8. Data sources and the constraint nobody should skip past

This is the part of the plan that most "let's build an India travel app" writeups gloss over, and it changes scope, so it's stated explicitly:

- **Flights:** Amadeus Self-Service API (free tier) covers this cleanly, same as the global version of this project.
- **Hotels:** Amadeus Hotel Search, same provider, low marginal effort.
- **Trains:** IRCTC has no open public self-service API. MakeMyTrip, ixigo, and Goibibo book trains through formal commercial/B2B partnerships with IRCTC, not a developer-accessible endpoint. Realistic options, in order of legitimacy: (a) build the Train Agent's interface against a clean internal schema now and integrate a licensed partner/aggregator API later if this goes beyond portfolio stage; (b) use publicly published static data (timetables, station codes, fare rules, historical PNR-confirmation datasets where they exist on data.gov.in or similar) to power search, fare estimation, and the prediction model without claiming real-time booking; (c) explicitly avoid unofficial scraping of IRCTC for a project meant to be shown to employers — it's a ToS and legal exposure problem, not just a technical one. The honest plan is: real flights and hotels, realistic-but-not-live trains/buses for v1, with the agent boundary designed so a licensed data source slots in later without an architecture rewrite.
- **Buses:** similarly no clean public self-serve API from RedBus/AbhiBus; same mitigation as trains.
- **Points of interest / itinerary:** Google Places API.
- **Weather/season advisories:** OpenWeatherMap or equivalent.
- **LLM reasoning for each agent:** Gemini (ADK's native integration).

Anyone picking this up should treat the train/bus data constraint as a known v1 limitation to state confidently in interviews, not something to hide — "I designed the agent so a licensed data partner can be swapped in without touching the orchestration layer" is a stronger engineering story than quietly scraping IRCTC.

---

## 9. Non-functional requirements

- Graceful degradation per agent (a slow/down Train Agent shouldn't block Flight/Hotel results).
- Caching in front of every paid/rate-limited external API.
- Idempotent replanning — refinement requests should only re-trigger the agents actually affected.
- Observability on agent latency and failure rate, since the live activity feed depends on accurate per-agent status.

---

## 10. What "usable app" means here, concretely

Not "demo that works once." A usable v1 means: a real user can describe a real multi-city Indian trip, get back flights/hotels priced from real APIs, a sane day-by-day plan, a train/bus recommendation with an honestly-labeled confirmation estimate, a budget that adds up, and the ability to save and revisit the trip. Polish (group voting, multilingual support, receipt organizing) comes after that core loop is solid, not before.

---

## 11. Build sequencing reference

Follows the phased plan already agreed for this project — stub agents first to de-risk A2A orchestration, then real Flight Agent, real Hotel Agent, Itinerary Agent, Budget Agent, then the India-specific Train/Bus/Multi-Modal agents (sequenced last specifically because their data layer is the constrained piece, so the orchestration and ML pipeline should already be proven before tackling it), then frontend, then auth/persistence/refinement, then deployment.
