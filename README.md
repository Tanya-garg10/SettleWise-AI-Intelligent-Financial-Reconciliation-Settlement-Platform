# SettleWise AI
### *Smarter Settlements. Stronger Business.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PayPal](https://img.shields.io/badge/PayPal-REST%20v2%20Sandbox-003087)](https://developer.paypal.com)
[![AG Grid](https://img.shields.io/badge/AG%20Grid-Community-brightgreen)](https://www.ag-grid.com)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.8%20Flash-4285F4)](https://ai.google.dev)
[![Render](https://img.shields.io/badge/Deploy-Render%20Blueprint-46E3B7)](https://render.com)

---

## 📌 Executive Summary

**SettleWise AI** is an intelligent financial reconciliation and settlement operations platform designed for mid-market and enterprise businesses. It pairs **PayPal Sandbox payment infrastructure** with **deterministic weighted reconciliation algorithms** and **Google Gemini AI forensic investigations**.

Unlike standard dashboards or generic chatbot wrappers, SettleWise AI implements a production-grade financial workflow:
1. **Captures and processes live PayPal Sandbox orders & webhooks**.
2. **Executes deterministic multi-signal matching** with decimal arithmetic across invoice numbers, decimal balances, payer identities, date proximity, and memo tokens.
3. **Forensically flags financial anomalies** (duplicate payment candidates, unexpected currency conversions, volume outliers, repeated failed attempts).
4. **Performs context-grounded AI investigations** via server-side Gemini 3.8 Flash, yielding structured root-cause explanations and evidence breakdowns.
5. **Enforces human-in-the-loop governance** where no financial transfer, refund, or settlement is executed without explicit CFO sign-off and an immutable audit trail.

---

## 🏆 Hackathon Sponsor Integrations

| Sponsor Tool | Role & Category | Specific Feature Implementation |
|---|---|---|
| **PayPal** | **Core Infrastructure** (Mandatory) | Official PayPal REST API v2: OAuth 2.0 client credential authentication, Order creation (`/v2/checkout/orders`), Payment capture (`/v2/checkout/orders/{id}/capture`), and Webhook signature verification (`/v1/notifications/verify-webhook-signature`). Transparent sandbox indicator with zero fake payment claims. |
| **AG Grid** | **Priority Sponsor Prize** | AG Grid Community embedded in Transaction Management: multi-column sorting, column filters, quick text search, pagination, custom risk renderers, and CSV export. |
| **APIMatic** | **Priority Sponsor Prize** | Integrated APIMatic Context Plugin (`npx context-plugins install paypal`) providing verified PayPal endpoint contracts, OAuth request schemas, and error definitions. |
| **Render** | **Priority Sponsor Prize** | Infrastructure-as-code `render.yaml` Blueprint defining web service (Vite + Node/Express), Python FastAPI backend, and managed PostgreSQL database. |
| **Postman** | **Additional Sponsor Tool** | Comprehensive `settlewise.postman_collection.json` containing automated test suites for OAuth, Orders, Captures, Webhooks, Reconciliation, and AI Copilot endpoints. |

---

## 🏛️ System Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │          React 19 + Tailwind Client          │
                  │   AG Grid · Recharts · Forensic Drawers     │
                  └──────────────────────┬───────────────────────┘
                                         │ REST API / Axios
                                         ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                      Express + Node / FastAPI Backend Layer                     │
├─────────────────────────┬─────────────────────────────┬────────────────────────┤
│   Reconciliation Engine │    Forensic Anomaly Engine  │   Settlement Governor  │
│  Deterministic Scoring: │    Duplicate Detection      │   Human Sign-off       │
│   · Invoice Ref (35%)   │    Volume Spikes            │   PayPal Action Auth   │
│   · Amount Match (30%)  │    FX Currency Discrepancy  │   Immutable Audit Log  │
│   · Identity Match (15%)│    Failed Bursts            │                        │
│   · Date Proximity (10%)│                             │                        │
│   · Token Sim (10%)     │                             │                        │
└────────────┬────────────┴──────────────┬──────────────┴───────────┬────────────┘
             │                           │                          │
             ▼                           ▼                          ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌───────────────────────┐
│ PayPal Sandbox REST API │ │ Google Gemini 3.8 Flash │ │ Persistent Data Store │
│ Orders · Captures · WH  │ │ Structured JSON Reports │ │ Invoices, Txns, Logs  │
└─────────────────────────┘ └─────────────────────────┘ └───────────────────────┘
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory (based on `.env.example`):

```bash
# Application Port & URLs
PORT=3000
FRONTEND_URL=http://localhost:3000
APP_ENV=development

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash

# PayPal Sandbox Developer Credentials
# Obtain from https://developer.paypal.com/dashboard/applications/sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_WEBHOOK_ID=your_webhook_id

# Database (for standalone FastAPI / PostgreSQL deployment)
DATABASE_URL=sqlite:///./settlewise.db
SECRET_KEY=replace_with_secure_random_key_for_production
```

> **Note:** If PayPal or Gemini credentials are not supplied, the platform runs seamlessly in **Sandbox Standby & Demonstration Mode**, providing full simulation of PayPal order creation, captures, webhooks, and deterministic financial forensics without crashing or faking live connections.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Install APIMatic Context Plugin
```bash
npx context-plugins install paypal
```

### 3. Start Full-Stack Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🧪 Testing with Postman

1. Open Postman.
2. Click **Import** and select `settlewise.postman_collection.json`.
3. Set the `baseUrl` collection variable to `http://localhost:3000`.
4. Run requests in sequence:
   - `1. PayPal Integration / Check PayPal Connection Status`
   - `1. PayPal Integration / Create PayPal Sandbox Order`
   - `1. PayPal Integration / Capture PayPal Payment`
   - `2. Reconciliation Engine / Run Deterministic Reconciliation Batch`
   - `3. Gemini AI Intelligence / Investigate Discrepant Transaction`
   - `4. Settlement Center / Approve Settlement Action`

---

## ☁️ Deployment on Render

This repository includes a production-ready Render Blueprint (`render.yaml`):

1. Push this repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** → **Blueprint**.
3. Select your repository.
4. Render will provision:
   - `settlewise-ai-app`: Full-Stack Node/React web service
   - `settlewise-postgres`: Managed PostgreSQL database
   - `settlewise-api-fastapi`: Optional Python FastAPI backend service
5. Add your `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, and `GEMINI_API_KEY` in the Render Environment Variables tab.

---

## 🔒 Security & Governance Principles

1. **Zero Silent Reconciliation:** Uncertain payments (<90% score or ambiguous candidate invoices) are placed in `MANUAL_REVIEW` and never marked as paid automatically.
2. **AI Is Advisory Only:** Gemini AI outputs structured risk assessments and root-cause evidence. It cannot trigger payouts or mutate payment records without explicit user authorization.
3. **No Key Exposure:** PayPal client secrets and Gemini API keys reside exclusively in backend environment variables and are never sent to browser bundles.
4. **Idempotency & Webhook Deduplication:** Webhook event IDs are stored to prevent replay attacks and duplicate processing.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
