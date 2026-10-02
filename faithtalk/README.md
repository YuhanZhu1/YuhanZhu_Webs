# FaithTalk

FaithTalk is a static chat interface with an Express/OpenAI backend. FaithTalk mode offers one-to-one Christian reflection. The Circle generates a short exchange between four fictional AI characters, with an optional targeted speaker. These are voices generated in one model request, not independently running agents or real users.

## Local development

Requires Node.js 20 or newer.

```sh
cd faithtalk/server
npm ci
```

Create `faithtalk/server/.env` using `.env.example`, set `OPENAI_API_KEY`, then start the backend:

```sh
npm start
```

From the repository root, serve the frontend:

```sh
python3 -m http.server 8765
```

Open `http://localhost:8765/faithtalk/`. On localhost, the frontend connects to `http://localhost:3000`. Production uses the `faithtalk-api` meta tag in `index.html`.

## Deployment

Deploy both the backend and frontend; the new UI requires backend API version 2. Deploy the backend first: existing JSON clients remain compatible with `/chat`.

For the existing Render web service:

- Root directory: `faithtalk/server`
- Build command: `npm ci`
- Start command: `npm start`
- Environment: `OPENAI_API_KEY` (required); `OPENAI_MODEL=gpt-5-nano` (optional, default)
- `/ping` returns `{ "status": "ready", "apiVersion": 2 }`.

Then publish the static frontend using the repository's existing hosting workflow. No frontend compilation is required. If hosting the frontend elsewhere, configure `ALLOWED_ORIGINS` as comma-separated origins and update the `faithtalk-api` meta tag.

Opening the page makes one health request to wake the backend. Free Render services can still take about a minute to start after inactivity. An always-on instance removes that particular hosting delay; changing prompts cannot remove it. The page shows connection state, lets users compose meanwhile, and does not issue model requests until connected. There is no periodic keep-alive traffic.

## Conversation and token behavior

- One model call per user turn, including group exchanges.
- Group replies: 2–3 short messages by at least two different characters; targeting a character returns one message.
- FaithTalk text streams as generated. Group messages appear as each complete structured reply arrives. No artificial typing delays.
- Server-owned concise prompts; client system prompts are ignored.
- Most recent 16 messages, up to 12,000 context characters; older details may be forgotten. Character counts are not exact token counts.
- Minimal reasoning effort and a 1,600 completion-token ceiling, including reasoning tokens. Raising this ceiling can help if real responses frequently finish incomplete, at increased token cost.
- No additional paid summarization requests. No automatic model retries.
- The token panel shows actual API usage for completed responses; interrupted/error responses can consume tokens that aren't shown.
- Separate in-memory histories for each mode. Reload clears both. Stop, mode changes, and new conversations cancel the pending request; failed partial replies are not kept in context.

## Checks

```sh
cd faithtalk/server
npm test
```

Tests use a fake OpenAI client: history limits, input validation, named-character context, incremental JSON parsing, one-call group streaming, targeted response validation, usage forwarding, and compatibility with older JSON clients. They require local port access but no API key or OpenAI requests.

## Data and deployment limits

The app keeps conversations only in tab memory. The server does not log chat text or store transcripts, and uses `store: false` for model requests. Hosting and API-provider data policies still apply; this is not a promise of zero provider retention. HTML from messages is rendered as text.

The API has request/body/output limits and an instance-local rate limiter. It is still a public, unauthenticated endpoint. CORS controls browser origins, not who can call the API. If usage expands, add authentication and a shared per-user rate limiter; the current limiter groups by Express's request IP, which may be a proxy address on Render.

Live model quality, real token savings, and production cold-start latency require testing after deployment with the actual hosting configuration. The local regression and browser checks use mocks rather than paid model calls.
