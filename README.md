# Voice UI Builder

Build UIs in real-time using your voice. Speak what you want, tap elements to select them, and watch your UI come to life. Pay with USDC on Solana.

Powered by OpenAI's Realtime API (WebRTC) for voice interaction and GPT-4o for UI code generation. Optimized for mobile/Android use as a PWA.

## Architecture

```
┌──────────────────────────────────────────────────────┐
│  Mobile Browser (Android PWA)                         │
│  ┌────────────┐  ┌───────────┐  ┌─────────────────┐ │
│  │ Login      │  │ Voice     │  │ UI Preview      │ │
│  │ Google /   │  │ Button    │  │ (iframe +       │ │
│  │ GitHub     │  │ (WebRTC)  │  │  Tailwind CSS)  │ │
│  └────────────┘  └─────┬─────┘  └─────────────────┘ │
│                        │ WebRTC                       │
│  ┌─────────────────────▼──────────────────────────┐  │
│  │  OpenAI Realtime API (gpt-4o-realtime)         │  │
│  │  → function calls: generate_ui / modify_ui     │  │
│  └────────────────────────────────────────────────┘  │
│                        │                              │
│  ┌─────────────────────▼──────────────────────────┐  │
│  │  Express API Server                             │  │
│  │  ├── /api/auth     (Google + GitHub OAuth)      │  │
│  │  ├── /api/credits  (usage tracking + purchase)  │  │
│  │  ├── /api/generate (GPT-4o → HTML/Tailwind)     │  │
│  │  └── /api/modify   (GPT-4o → update code)      │  │
│  └────────────────────────────────────────────────┘  │
│                        │                              │
│  ┌─────────────────────▼──────────────────────────┐  │
│  │  Solana Blockchain                              │  │
│  │  ├── USDC payments via Phantom wallet           │  │
│  │  └── Anchor smart contract (on-chain credits)   │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

## How It Works

1. **Sign in** with Google or GitHub
2. **Get 10 free UI credits** on signup
3. **Tap the mic button** to connect to OpenAI's Realtime API via WebRTC
4. **Describe the UI** you want: "Create a login form with email and password fields"
5. The AI calls `generate_ui` → GPT-4o generates HTML + Tailwind CSS → **live preview**
6. **Tap any element** to select it, then say modifications
7. Each generation/modification costs **1 credit**
8. When credits run out, **connect Phantom wallet** and pay **2 USDC for 10 more credits**

## Payments

- **Blockchain:** Solana (devnet for testing, mainnet for production)
- **Currency:** USDC (SPL token)
- **Wallet:** Phantom (mobile-native on Android)
- **Flow:** Server builds a USDC transfer transaction → user signs in Phantom → server verifies on-chain → credits added
- **Smart contract:** Anchor program at `programs/voice_ui_credits/` for on-chain credit tracking

## Setup

### Prerequisites

- Node.js 18+
- OpenAI API key (Realtime API + GPT-4o access)
- Google OAuth credentials (from Google Cloud Console)
- GitHub OAuth app (from GitHub Developer Settings)
- Phantom wallet (your Solana wallet public key)

### Install

```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### Configure

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# OpenAI
OPENAI_API_KEY=sk-...

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Solana — your Phantom wallet public key
SOLANA_OWNER_WALLET=YourPhantomWalletPublicKeyHere
SOLANA_RPC_URL=https://api.devnet.solana.com
```

### Run

```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3001

### Android / Mobile

Open `http://<your-ip>:5173` on your Android phone's browser. The app is PWA-enabled — add it to your home screen for a native-like experience. Phantom wallet integrates natively on mobile.

## API Endpoints

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/google` | GET | - | Start Google OAuth flow |
| `/api/auth/github` | GET | - | Start GitHub OAuth flow |
| `/api/auth/me` | GET | - | Get current user |
| `/api/auth/wallet` | POST | Yes | Link Solana wallet to account |
| `/api/auth/logout` | POST | Yes | Sign out |
| `/api/credits` | GET | Yes | Get credit balance |
| `/api/credits/payment-info` | GET | - | Get pricing and network info |
| `/api/credits/purchase` | POST | Yes | Build USDC purchase transaction |
| `/api/credits/verify` | POST | Yes | Verify payment and add credits |
| `/api/realtime/token` | GET | Yes | Generate ephemeral WebRTC token |
| `/api/generate-ui` | POST | Yes | Generate UI (costs 1 credit) |
| `/api/modify-ui` | POST | Yes | Modify UI (costs 1 credit) |

## Smart Contract

The Anchor program in `programs/voice_ui_credits/` handles:

- **User account creation** with 10 free credits (PDA per user)
- **USDC credit purchases** (2 USDC → 10 credits)
- **Credit deduction** (only callable by service authority)
- **On-chain credit balance tracking**

To deploy to devnet:
```bash
anchor build
anchor deploy --provider.cluster devnet
```

## Tech Stack

- **Frontend:** React 18 + Vite (mobile-optimized PWA)
- **Backend:** Express.js + Passport.js (OAuth)
- **Voice:** OpenAI Realtime API via WebRTC
- **Code Gen:** OpenAI GPT-4o
- **Payments:** Solana + USDC + Phantom wallet
- **Smart Contract:** Anchor (Rust)
- **Styling:** Tailwind CSS (CDN in preview)

## Note on GPT-5.3-Codex-Spark

Currently using `gpt-4o` for code generation since GPT-5.3-Codex-Spark is only available in ChatGPT Pro (not the API yet). When the Codex Spark API becomes available, update the model in `server/index.js` to get 1000+ tokens/sec generation on Cerebras hardware.
