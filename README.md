# Voice UI Builder

Build UIs in real-time using your voice. Speak what you want, tap elements to select them, and watch your UI come to life.

Powered by OpenAI's Realtime API (WebRTC) for voice interaction and GPT-4o for UI code generation. Optimized for mobile/Android use as a PWA.

## Architecture

```
┌─────────────────────────────────────────┐
│  Mobile Browser (PWA)                    │
│  ┌─────────────┐  ┌──────────────────┐  │
│  │ Voice Button │  │   UI Preview     │  │
│  │  (WebRTC)    │  │   (iframe +      │  │
│  │              │  │    Tailwind CSS)  │  │
│  └──────┬───────┘  └──────────────────┘  │
│         │ WebRTC                          │
│         ▼                                │
│  OpenAI Realtime API (gpt-4o-realtime)   │
│         │ function calls                  │
│         ▼                                │
│  ┌──────────────┐                        │
│  │ Express API   │──► OpenAI Chat API    │
│  │ /api/generate │    (gpt-4o)           │
│  │ /api/modify   │    generates HTML +   │
│  │ /api/token    │    Tailwind CSS       │
│  └──────────────┘                        │
└─────────────────────────────────────────┘
```

## How It Works

1. **Tap the mic button** to connect to OpenAI's Realtime API via WebRTC
2. **Describe the UI** you want: "Create a login form with email and password fields"
3. The AI assistant calls a `generate_ui` function which sends the description to GPT-4o
4. GPT-4o generates HTML + Tailwind CSS code
5. The **live preview** renders the generated UI immediately
6. **Tap any element** in the preview to select it
7. **Say modifications**: "Make the button bigger" or "Change the color to blue"
8. The AI calls `modify_ui` to update the code

## Setup

### Prerequisites

- Node.js 18+
- OpenAI API key with access to Realtime API and GPT-4o

### Install

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### Configure

```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### Run

```bash
# Run both server and client
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3001

### Android / Mobile

Open `http://<your-ip>:5173` on your Android phone's browser. The app is PWA-enabled — you can add it to your home screen for a native-like experience.

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/realtime/token` | GET | Generate ephemeral token for WebRTC connection |
| `/api/generate-ui` | POST | Generate UI code from description |
| `/api/modify-ui` | POST | Modify existing UI code |

## Tech Stack

- **Frontend:** React 18 + Vite (mobile-optimized PWA)
- **Backend:** Express.js
- **Voice:** OpenAI Realtime API via WebRTC
- **Code Gen:** OpenAI GPT-4o (upgradeable to Codex when API available)
- **Styling:** Tailwind CSS (loaded via CDN in preview)

## Note on GPT-5.3-Codex-Spark

This app is designed to work with OpenAI's Codex models. Currently using `gpt-4o` for code generation since GPT-5.3-Codex-Spark is only available in ChatGPT Pro (not the API yet). When the Codex Spark API becomes available, update the model in `server/index.js` to take advantage of the 1000+ tokens/sec generation speed on Cerebras hardware.
