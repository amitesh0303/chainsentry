# ChainSentry — Blockchain Transaction Security API

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)

> Pre-execution blockchain transaction security for AI trading bots and DeFi agents. Detect honeypots, rug pulls, MEV attacks, and exploits **before** they happen.

---

## 🧠 What is ChainSentry?

ChainSentry is a production-ready SaaS security layer that analyzes blockchain transactions and contracts for threats in real time. It's designed for LLM-based trading agents, MEV bots, and DeFi protocols that need to validate transactions before on-chain execution.

**API Response Example:**

```json
{
  "verdict": "BLOCKED",
  "risk_score": 94,
  "chain": "ethereum",
  "contract": "0x...",
  "threats": ["HONEYPOT", "HIGH_TAX"],
  "warnings": [
    "Token has no sell function",
    "Owner can blacklist wallets",
    "Buy tax: 5%, Sell tax: 99%"
  ],
  "simulation": {
    "success": false,
    "gas_used": null,
    "revert_reason": "Token has no sell function"
  },
  "latency_ms": 8,
  "cached": false
}
```

---

## 🚀 Features

### Threat Detection Modules
| Module | Description |
|--------|-------------|
| **Honeypot Detection** | Analyzes bytecode and LP reserves for tokens with blocked sell functions |
| **Rug Pull Risk** | Checks owner mint permissions, LP lock status, and supply distribution |
| **Wallet Drainer / Malicious Approvals** | Detects unlimited ERC-20 approvals and NFT `setApprovalForAll` to unknown contracts |
| **MEV / Sandwich Attack Risk** | Analyzes swap calldata for high slippage and large-value front-run targets |
| **Tax Analysis** | Reads buy/sell tax variables from contract storage and DEX reserves |
| **Blacklist Checks** | Verifies if wallet is blacklisted across multiple blacklist function signatures |
| **Contract Similarity Engine** | Compares bytecode hash against known-scam database |
| **Multi-Chain Support** | Ethereum, BSC, Polygon, Arbitrum, Base, Optimism |

### API Endpoints
```
POST   /api/v1/check                      → Main transaction safety check
GET    /api/v1/token/:chainId/:address    → Token/contract analysis  
GET    /api/v1/status                     → API health check
POST   /api/v1/webhook/register          → Register webhook URL (Pro+)
GET    /api/v1/usage                      → Current API key usage stats
```

### Platform Features
- 🔑 **API Key Management** — Generate, rotate, revoke keys from dashboard
- 💳 **Stripe Billing** — Free / Pro / Scale / Builder / Enterprise tiers
- 🎁 **30-Day Free Trial** — Pro and Scale plans, no credit card required
- ⚡ **Redis Caching** — <10ms for cached results (60s TTL)
- 📊 **Usage Analytics** — Per-key usage tracking and rate limiting
- 🔔 **Webhook Alerts** — Real-time notifications for blocked transactions (Pro+)
- 🛡️ **Rate Limiting** — Per-plan daily limits enforced via database

---

## 💳 Pricing Tiers

| Plan | Price | Req/Day | Free Trial |
|------|-------|---------|------------|
| Free | $0 | 50 | — |
| Pro | $99/month | 10,000 | ✅ 30 days, no CC |
| Scale | $299/month | 50,000 | ✅ 30 days, no CC |
| Builder | Custom | Custom | Contact Sales |
| Enterprise | Custom | Unlimited | Contact Sales |

---

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Database**: PostgreSQL via Prisma ORM
- **Cache**: Redis (ioredis) — 60s TTL per contract
- **Blockchain**: ethers.js v6 for on-chain contract reads
- **Auth**: NextAuth.js v4 (credentials + Google OAuth)
- **Payments**: Stripe (subscriptions with trial support)
- **Validation**: Zod for all API inputs
- **UI Components**: Radix UI + shadcn/ui patterns

---

## 📦 Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### 1. Clone and Install

```bash
git clone https://github.com/amitesh0303/chainsentry
cd chainsentry
npm install
```

### 2. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

**Required variables:**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/chainsentry"

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_PRO_MONTHLY_PRICE_ID="price_..."
STRIPE_SCALE_MONTHLY_PRICE_ID="price_..."

# Redis
REDIS_URL="redis://localhost:6379"

# Blockchain RPC Endpoints (use Alchemy/Infura for reliability)
ETHEREUM_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY"
BSC_RPC_URL="https://bsc-dataseed.binance.org"
POLYGON_RPC_URL="https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY"
ARBITRUM_RPC_URL="https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY"
BASE_RPC_URL="https://base-mainnet.g.alchemy.com/v2/YOUR_KEY"
OPTIMISM_RPC_URL="https://mainnet.optimism.io"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed with test data
npx prisma db seed
```

### 4. Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create two recurring products: **Pro** ($99/month) and **Scale** ($299/month)
3. Copy the price IDs to your `.env.local`
4. Set up webhook endpoint: `https://your-domain.com/api/stripe/webhook`
5. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🔌 API Usage

### Authentication

All API requests require an API key in the `Authorization` header:

```
Authorization: Bearer csk_your_api_key_here
```

Generate your key at [chainsentry.io/dashboard](https://chainsentry.io/dashboard) or via:

```bash
curl -X POST https://chainsentry.io/api/keys \
  -H "Cookie: next-auth.session-token=..."
```

### Check a Transaction

```bash
curl -X POST https://chainsentry.io/api/v1/check \
  -H "Authorization: Bearer csk_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "chainId": "1",
    "contractAddress": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    "walletAddress": "0xYourWalletAddress",
    "calldata": "0x38ed1739..."
  }'
```

### JavaScript Integration (LangChain Agent)

```typescript
import { ChainSentry } from "@chainsentry/sdk";
import { Tool } from "langchain/tools";

const sentry = new ChainSentry({ apiKey: process.env.CHAINSENTRY_API_KEY });

const checkTxSafety = new Tool({
  name: "check_transaction_safety",
  description: "Check if a blockchain transaction is safe before execution",
  func: async (txJson: string) => {
    const tx = JSON.parse(txJson);
    const result = await sentry.check(tx);
    if (result.verdict === "BLOCKED") {
      return `BLOCKED - Threats: ${result.threats.join(", ")}`;
    }
    return "SAFE - Transaction cleared for execution";
  },
});
```

### Python Integration (AutoGPT Tool)

```python
import requests

def check_transaction_safety(chain_id: str, contract: str, wallet: str = None) -> dict:
    """Check blockchain transaction safety before execution."""
    response = requests.post(
        "https://chainsentry.io/api/v1/check",
        headers={"Authorization": f"Bearer {CHAINSENTRY_API_KEY}"},
        json={"chainId": chain_id, "contractAddress": contract, "walletAddress": wallet}
    )
    return response.json()

# Usage
result = check_transaction_safety("1", "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
if result["verdict"] == "BLOCKED":
    print(f"🚨 THREAT: {result['threats']}")
else:
    print("✅ SAFE to execute")
```

---

## 🏢 Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (auth)/register/       # Register page
│   ├── admin/                 # Admin dashboard
│   ├── dashboard/             # User dashboard
│   ├── docs/                  # API documentation
│   ├── pricing/               # Pricing page
│   ├── api/
│   │   ├── auth/              # NextAuth + register
│   │   ├── keys/              # API key CRUD
│   │   ├── stripe/            # Checkout, webhook, portal
│   │   └── v1/                # Public API endpoints
│   └── page.tsx               # Landing page
├── components/
│   ├── landing/               # Landing page sections
│   └── Providers.tsx          # NextAuth session provider
└── lib/
    ├── blockchain/            # Chain utilities
    ├── threats/               # Threat detection modules
    │   ├── analyzer.ts        # Main analysis orchestrator
    │   ├── honeypot.ts        # Honeypot detection
    │   ├── rugpull.ts         # Rug pull risk
    │   ├── drainer.ts         # Wallet drainer detection
    │   ├── mev.ts             # MEV/sandwich risk
    │   ├── tax.ts             # Tax analysis
    │   ├── blacklist.ts       # Blacklist checks
    │   └── similarity.ts      # Contract similarity
    ├── api-keys.ts            # Key generation, validation, rate limiting
    ├── chains.ts              # Chain registry
    ├── prisma.ts              # Database client
    ├── provider.ts            # ethers.js providers + ABIs
    └── redis.ts               # Cache client
prisma/
└── schema.prisma              # Database schema
```

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

Set all environment variables in the Vercel dashboard.

### Docker

```bash
docker build -t chainsentry .
docker run -p 3000:3000 --env-file .env.local chainsentry
```

### Railway / Fly.io

1. Connect your GitHub repo
2. Add PostgreSQL and Redis addons
3. Set environment variables
4. Deploy

---

## 📊 Performance

| Metric | Target | Notes |
|--------|--------|-------|
| Cached response | <10ms | Redis TTL: 60s |
| Fresh analysis | <500ms | Parallel threat detection |
| Uptime SLA | 99.9% | Scale plan and above |
| Daily capacity | 50k+ req/day | Scale plan |

---

## 🔐 Security

- API keys stored as SHA-256 hashes (never plaintext)
- Keys are prefixed with `csk_` for easy identification
- Rate limiting enforced at database level per user
- All inputs validated with Zod schemas
- CORS configured for browser-based integrations
- Stripe webhook signatures verified on every event
- Keys are rotatable without account deletion

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ for the DeFi security community.
