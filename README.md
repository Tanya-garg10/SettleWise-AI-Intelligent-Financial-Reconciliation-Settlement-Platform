# SettleWise AI
### Smarter Settlements. Stronger Business.

An AI-powered financial reconciliation and settlement intelligence platform that helps businesses match payments with invoices, investigate financial discrepancies, detect unusual transaction patterns, and manage payment workflows with human approval.

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License" />
  <img src="https://img.shields.io/badge/PayPal-REST%20API%20Sandbox-003087" alt="PayPal" />
  <img src="https://img.shields.io/badge/AG%20Grid-Community-brightgreen" alt="AG Grid" />
  <img src="https://img.shields.io/badge/AI-Google%20Gemini-4285F4" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/Deployment-Render-46E3B7" alt="Render" />
</p>

## Overview

Financial reconciliation is often time-consuming. Businesses may receive payments that do not immediately match their invoices because of reference mismatches, partial payments, duplicate transactions, delayed settlements, or incorrect amounts.

**SettleWise AI** addresses this challenge through deterministic financial matching, AI-assisted investigation, and PayPal payment integration.

Rather than relying on a generic AI chatbot, the platform combines rule-based financial calculations with contextual AI intelligence to make reconciliation more transparent and actionable.

### What SettleWise AI Does

- **Payment Reconciliation:** Matches PayPal transactions with business invoices using multiple financial and contextual signals.
- **Intelligent Matching:** Calculates matching confidence using invoice references, amounts, customer identity, dates, and description similarity.
- **Anomaly Detection:** Identifies potential duplicate payments, amount discrepancies, unusual transaction volumes, and repeated failed attempts.
- **AI Investigation:** Uses Google Gemini to generate contextual explanations and evidence-based investigation summaries.
- **Settlement Management:** Organizes settlement recommendations and approval workflows.
- **Human-in-the-Loop Governance:** Keeps financial decisions under user control instead of allowing AI to independently execute sensitive actions.

## Key Features

| Feature | Description |
|---|---|
| Financial Dashboard | Overview of payment volume, reconciliation status, outstanding invoices, and financial trends |
| Transaction Explorer | Searchable and filterable transaction management using AG Grid |
| Reconciliation Engine | Weighted matching across multiple transaction and invoice attributes |
| Anomaly Intelligence | Rule-based detection of suspicious or unusual financial patterns |
| AI Investigation | Gemini-powered explanations and structured investigation reports |
| Invoice Management | Track invoice amounts, due dates, partial payments, and outstanding balances |
| Settlement Center | Review and approve settlement-related actions |
| PayPal Integration | Sandbox order creation, payment capture, and webhook processing |
| Audit Trail | Maintain a record of important reconciliation and approval activities |

## Technology Stack

### Frontend
- React
- JavaScript / TypeScript
- Tailwind CSS
- AG Grid Community
- Recharts

### Backend
- Python
- FastAPI
- REST APIs
- SQL database (SQLite / PostgreSQL)

### AI & Intelligence
- Google Gemini API
- Deterministic weighted reconciliation algorithm
- Rule-based anomaly detection
- Structured AI investigation responses

### Payment Infrastructure
- PayPal REST API v2
- PayPal Sandbox
- OAuth 2.0
- Orders API
- Payment Capture API
- Webhooks

### Developer Tools & Deployment
- APIMatic Context Plugin
- Postman
- GitHub
- Render

## System Architecture

```text
                 ┌──────────────────────────────┐
                 │       React Frontend         │
                 │                              │
                 │ Dashboard · AG Grid          │
                 │ Reconciliation · Analytics   │
                 │ AI Investigation · Reports   │
                 └──────────────┬───────────────┘
                                │
                         REST API / HTTPS
                                │
                                ▼
                 ┌──────────────────────────────┐
                 │       FastAPI Backend        │
                 │                              │
                 │ Authentication & APIs        │
                 │ Business Logic               │
                 └──────────────┬───────────────┘
                                │
           ┌────────────────────┼────────────────────┐
           │                    │                    │
           ▼                    ▼                    ▼
 ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
 │ Reconciliation   │ │ Anomaly Detection│ │ Settlement       │
 │ Engine           │ │ Engine           │ │ Governance       │
 │                  │ │                  │ │                  │
 │ Weighted Scoring │ │ Duplicate Checks │ │ Human Approval   │
 │ Amount Matching  │ │ Volume Analysis  │ │ Audit Logging    │
 │ Identity Matching│ │ Failed Attempts  │ │ Payment Actions  │
 └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
       ┌──────────────────┐       ┌──────────────────┐
       │ PayPal Sandbox   │       │ Google Gemini    │
       │                  │       │                  │
       │ OAuth 2.0        │       │ AI Investigations│
       │ Orders & Capture │       │ Structured Output│
       │ Webhooks         │       │ Evidence Analysis│
       └──────────────────┘       └──────────────────┘

                    ┌────────────────────┐
                    │ Persistent Database│
                    │ Invoices           │
                    │ Transactions       │
                    │ Matches & Logs     │
                    │ Approval Records   │
                    └────────────────────┘
```

## Reconciliation Intelligence

SettleWise AI uses a deterministic weighted scoring algorithm to evaluate possible invoice-payment matches.

### Matching Signals

| Signal | Weight |
|---|---:|
| Invoice Reference Match | 35% |
| Amount Match | 30% |
| Customer Identity Match | 15% |
| Date Proximity | 10% |
| Description Similarity | 10% |
| **Total** | **100%** |

### Confidence Interpretation

| Confidence Score | Recommended Status |
|---|---|
| 90–100% | High-confidence match candidate |
| 70–89% | Requires review |
| Below 70% | Manual investigation |

These scores represent matching confidence, not proof of payment authenticity. Ambiguous matches require human review.

Financial amounts are handled using decimal arithmetic to avoid floating-point precision errors.

## AI-Powered Financial Investigation

Google Gemini adds contextual intelligence to the reconciliation workflow.

The AI investigation layer can help:

- Explain why a transaction did not match an invoice.
- Summarize potential payment discrepancies.
- Identify relevant matching signals.
- Explain anomaly detection results.
- Recommend appropriate investigation steps.
- Generate structured financial investigation reports.

**Important design principle:** Financial calculations, matching decisions, and transaction state changes remain controlled by deterministic backend logic. Gemini provides explanations and recommendations; it does not independently approve payments or modify financial records.

## PayPal Integration

SettleWise AI integrates with the official PayPal REST API v2 Sandbox environment.

### Supported Integration Workflows

1. OAuth 2.0 client credential authentication.
2. PayPal Sandbox order creation.
3. Order retrieval and approval workflow.
4. Payment capture.
5. Webhook event handling.
6. Webhook signature verification.
7. Payment event deduplication.

### API Endpoints Used

| Operation | PayPal Endpoint |
|---|---|
| Create Order | `POST /v2/checkout/orders` |
| Capture Order | `POST /v2/checkout/orders/{id}/capture` |
| Verify Webhook | `POST /v1/notifications/verify-webhook-signature` |

All payment operations use Sandbox credentials during development and demonstration.

A successful API response is required before the application reports an order or capture as successful.

## Sponsor Tool Integrations

| Tool | Role in the Project |
|---|---|
| PayPal | Core payment infrastructure through REST API v2 Sandbox |
| AG Grid Community | Interactive transaction and reconciliation tables |
| APIMatic | PayPal API context and developer integration support |
| Render | Application hosting and deployment |
| Postman | API testing and workflow validation |
| Google Gemini | AI-assisted financial investigations |

Only integrations actually configured and demonstrated in the submitted application should be represented as completed integrations.

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js and npm
- Python 3.10+
- Git
- PayPal Developer Sandbox account
- Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/SettleWise-AI.git

cd SettleWise-AI
```

### 2. Configure Environment Variables

Create a `.env` file using the provided `.env.example`.

```env
# Application
APP_ENV=development
FRONTEND_URL=http://localhost:5173

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_supported_gemini_model

# PayPal Sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_WEBHOOK_ID=your_webhook_id

# Database
DATABASE_URL=sqlite:///./settlewise.db

# Security
SECRET_KEY=replace_with_a_secure_random_secret
```

Never commit your actual `.env` file or API credentials to GitHub.

### 3. Start the Backend

```bash
cd backend

python -m venv venv
```

Activate the environment:

**Windows:**
```bash
venv\Scripts\activate
```

**Linux / macOS:**
```bash
source venv/bin/activate
```

Install dependencies and start FastAPI:

```bash
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

Backend API documentation:

`http://localhost:8000/docs`

### 4. Start the Frontend

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

Open the local frontend URL printed by Vite, usually:

`http://localhost:5173`

> Adjust the commands and folder names if your repository uses a different project structure.

## Postman API Testing

If the repository includes `settlewise.postman_collection.json`:

1. Open Postman.
2. Select **Import**.
3. Import the SettleWise AI collection.
4. Configure the `baseUrl` variable.
5. Run the relevant requests.

Suggested testing sequence:

1. Check PayPal connection status.
2. Create a PayPal Sandbox order.
3. Retrieve and capture the approved order.
4. Run a reconciliation batch.
5. Investigate a discrepant transaction using Gemini.
6. Review and approve a settlement action.
7. Verify webhook processing and audit records.

## Security & Financial Governance

SettleWise AI follows a human-controlled financial workflow.

**1. No Silent Reconciliation**

Uncertain matches are sent for manual review rather than automatically marking invoices as paid.

**2. AI Is Advisory Only**

AI-generated recommendations cannot independently execute payment captures, refunds, or settlement actions.

**3. Secure Credential Handling**

PayPal client secrets and Gemini API keys remain on the backend and are not exposed in frontend code.

**4. Webhook Verification**

PayPal webhook signatures should be verified before processing events.

**5. Idempotent Event Processing**

Webhook event IDs are tracked to prevent duplicate event processing.

**6. Auditability**

Important financial actions and approval decisions should be recorded for traceability.

## Future Roadmap

- Advanced multi-currency reconciliation.
- More sophisticated payment anomaly analysis.
- Automated invoice ingestion using OCR.
- Multi-user finance team collaboration.
- Role-based approval permissions.
- Advanced cash-flow forecasting.
- Additional payment gateway integrations.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Project Vision

**SettleWise AI is built around one simple idea: financial operations should be intelligent, transparent, and accountable.**

By combining deterministic reconciliation, AI-powered investigation, and PayPal payment infrastructure, SettleWise AI aims to make business settlements easier to understand and safer to manage.

**Smarter Settlements. Stronger Business.**
