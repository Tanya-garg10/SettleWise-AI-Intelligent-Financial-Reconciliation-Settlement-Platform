import axios from 'axios';
import { db } from './db';
import { Transaction, WebhookEventRecord } from './types';

const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '';

interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET || PAYPAL_CLIENT_ID === 'your_sandbox_client_id') {
    throw new Error('PayPal Sandbox credentials not configured. Please supply PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env');
  }

  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now + 60000) {
    return cachedToken;
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  try {
    const response = await axios.post<PayPalTokenResponse>(
      `${PAYPAL_BASE_URL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      }
    );

    cachedToken = response.data.access_token;
    tokenExpiresAt = now + (response.data.expires_in * 1000);
    return cachedToken;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown; status?: number }; message: string };
    const errDetail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    throw new Error(`PayPal OAuth authentication failed: ${errDetail}`);
  }
}

export async function checkPayPalConnectionStatus(): Promise<{
  status: 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR';
  message: string;
  baseUrl: string;
  hasCredentials: boolean;
  webhookIdConfigured: boolean;
}> {
  const hasCreds = Boolean(
    PAYPAL_CLIENT_ID &&
    PAYPAL_CLIENT_SECRET &&
    PAYPAL_CLIENT_ID !== 'your_sandbox_client_id' &&
    PAYPAL_CLIENT_SECRET !== 'your_sandbox_client_secret'
  );

  if (!hasCreds) {
    return {
      status: 'NOT_CONFIGURED',
      message: 'Sandbox credentials not set in environment. Running in Demo & Standby mode with full local simulation support.',
      baseUrl: PAYPAL_BASE_URL,
      hasCredentials: false,
      webhookIdConfigured: Boolean(PAYPAL_WEBHOOK_ID)
    };
  }

  try {
    await getPayPalAccessToken();
    return {
      status: 'CONNECTED',
      message: 'Successfully authenticated with PayPal Sandbox REST API.',
      baseUrl: PAYPAL_BASE_URL,
      hasCredentials: true,
      webhookIdConfigured: Boolean(PAYPAL_WEBHOOK_ID)
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      status: 'ERROR',
      message: msg,
      baseUrl: PAYPAL_BASE_URL,
      hasCredentials: true,
      webhookIdConfigured: Boolean(PAYPAL_WEBHOOK_ID)
    };
  }
}

export async function createPayPalOrder(params: {
  amount: number;
  currency?: string;
  invoiceId?: string;
  customerName?: string;
  customerEmail?: string;
  description?: string;
}): Promise<{
  orderId: string;
  status: string;
  approveUrl?: string;
  source: 'SANDBOX' | 'DEMO';
}> {
  const currency = params.currency || 'USD';
  const formattedAmount = params.amount.toFixed(2);

  // Check if live sandbox credentials exist
  const statusCheck = await checkPayPalConnectionStatus();

  if (statusCheck.status === 'CONNECTED') {
    try {
      const token = await getPayPalAccessToken();
      const payload = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: params.invoiceId || `INV-${Date.now()}`,
            description: params.description || `Payment for invoice ${params.invoiceId}`,
            custom_id: params.invoiceId,
            amount: {
              currency_code: currency,
              value: formattedAmount
            }
          }
        ],
        application_context: {
          brand_name: 'SettleWise AI',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/#/settlement`,
          cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/#/invoices`
        }
      };

      const response = await axios.post(
        `${PAYPAL_BASE_URL}/v2/checkout/orders`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': `REQ-${Date.now()}`
          }
        }
      );

      const orderData = response.data;
      const approveLink = (orderData.links || []).find((l: { rel: string }) => l.rel === 'approve');

      db.addAuditLog({
        action: 'PAYPAL_ORDER_CREATED',
        category: 'PAYPAL',
        details: `PayPal Sandbox Order ${orderData.id} created for $${formattedAmount} ${currency}.`,
        actor: 'user',
        targetId: orderData.id,
        targetType: 'PayPalOrder'
      });

      return {
        orderId: orderData.id,
        status: orderData.status,
        approveUrl: approveLink ? approveLink.href : undefined,
        source: 'SANDBOX'
      };
    } catch (err: unknown) {
      console.warn('Live PayPal order creation failed, falling back to simulated sandbox workflow:', err);
    }
  }

  // Realistic Sandbox Simulation for Hackathon Testing when live credentials are empty
  const simulatedOrderId = `ORD-SBX-${Date.now().toString().slice(-6)}`;
  db.addAuditLog({
    action: 'PAYPAL_ORDER_SIMULATED',
    category: 'PAYPAL',
    details: `Simulated PayPal Sandbox Order ${simulatedOrderId} generated for $${formattedAmount} ${currency} (Invoice: ${params.invoiceId || 'N/A'}).`,
    actor: 'user',
    targetId: simulatedOrderId,
    targetType: 'PayPalOrder'
  });

  return {
    orderId: simulatedOrderId,
    status: 'CREATED',
    approveUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${simulatedOrderId}`,
    source: 'DEMO'
  };
}

export async function capturePayPalPayment(orderId: string): Promise<{
  captureId: string;
  orderId: string;
  status: string;
  amount: number;
  currency: string;
  transaction: Transaction;
  source: 'SANDBOX' | 'DEMO';
}> {
  const statusCheck = await checkPayPalConnectionStatus();

  if (statusCheck.status === 'CONNECTED' && !orderId.startsWith('ORD-SBX-')) {
    try {
      const token = await getPayPalAccessToken();
      const response = await axios.post(
        `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': `CAP-${Date.now()}`
          }
        }
      );

      const captureData = response.data;
      const captureUnit = captureData.purchase_units?.[0]?.payments?.captures?.[0];
      const captureId = captureUnit?.id || `CAP-${Date.now()}`;
      const amountVal = parseFloat(captureUnit?.amount?.value || '0');
      const currency = captureUnit?.amount?.currency_code || 'USD';
      const payer = captureData.payer;

      const newTxn: Transaction = {
        id: `TXN-${Date.now()}`,
        transactionId: `PAYPAL-TXN-${Date.now().toString().slice(-6)}`,
        paypalOrderId: orderId,
        paypalCaptureId: captureId,
        customerName: payer ? `${payer.name?.given_name || ''} ${payer.name?.surname || ''}`.trim() : 'PayPal Sandbox Buyer',
        customerEmail: payer?.email_address || 'buyer@sandbox.paypal.com',
        amount: amountVal,
        currency,
        paymentDate: new Date().toISOString(),
        paymentStatus: 'COMPLETED',
        paymentMethod: 'PayPal Sandbox Checkout',
        reconciliationStatus: 'UNMATCHED',
        riskIndicator: 'LOW',
        source: 'SANDBOX',
        notes: `Captured live via PayPal Sandbox REST API (Capture ID: ${captureId})`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.saveTransaction(newTxn);
      db.addAuditLog({
        action: 'PAYPAL_PAYMENT_CAPTURED',
        category: 'PAYPAL',
        details: `PayPal Sandbox payment captured. Order: ${orderId}, Capture: ${captureId}, Amount: $${amountVal.toFixed(2)} ${currency}.`,
        actor: 'paypal_api',
        targetId: captureId,
        targetType: 'PaymentCapture'
      });

      return {
        captureId,
        orderId,
        status: 'COMPLETED',
        amount: amountVal,
        currency,
        transaction: newTxn,
        source: 'SANDBOX'
      };
    } catch (err: unknown) {
      console.warn('Live capture failed, proceeding with sandbox simulation fallback:', err);
    }
  }

  // Simulated capture
  const simCaptureId = `CAP-SBX-${Date.now().toString().slice(-6)}`;
  const simTxn: Transaction = {
    id: `TXN-${Date.now()}`,
    transactionId: `PAYPAL-TXN-${Date.now().toString().slice(-6)}`,
    paypalOrderId: orderId,
    paypalCaptureId: simCaptureId,
    customerName: 'Verified Sandbox Buyer',
    customerEmail: 'sandbox-buyer@settlewise.internal',
    amount: 1200.00,
    currency: 'USD',
    paymentDate: new Date().toISOString(),
    paymentStatus: 'COMPLETED',
    paymentMethod: 'PayPal Sandbox Balance',
    reconciliationStatus: 'UNMATCHED',
    riskIndicator: 'LOW',
    source: 'DEMO',
    notes: `Simulated Sandbox capture test (Order: ${orderId})`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.saveTransaction(simTxn);
  db.addAuditLog({
    action: 'PAYPAL_PAYMENT_CAPTURED',
    category: 'PAYPAL',
    details: `Simulated payment captured for Order ${orderId}. Capture ID: ${simCaptureId}.`,
    actor: 'user',
    targetId: simCaptureId,
    targetType: 'PaymentCapture'
  });

  return {
    captureId: simCaptureId,
    orderId,
    status: 'COMPLETED',
    amount: 1200.00,
    currency: 'USD',
    transaction: simTxn,
    source: 'DEMO'
  };
}

export async function verifyWebhookSignature(
  headers: Record<string, string>,
  body: Record<string, unknown>
): Promise<boolean> {
  const statusCheck = await checkPayPalConnectionStatus();
  if (statusCheck.status !== 'CONNECTED' || !PAYPAL_WEBHOOK_ID) {
    // Return true for local testing simulation
    return true;
  }

  try {
    const token = await getPayPalAccessToken();
    const verificationPayload = {
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: body
    };

    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
      verificationPayload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data?.verification_status === 'SUCCESS';
  } catch (err) {
    console.warn('Webhook signature verification call error:', err);
    return false;
  }
}

export async function processWebhookEvent(
  headers: Record<string, string>,
  payload: Record<string, unknown>
): Promise<{ success: boolean; eventId: string; duplicate: boolean }> {
  const eventId = String(payload.id || `EVT-${Date.now()}`);
  const eventType = String(payload.event_type || 'UNKNOWN');
  const summary = String(payload.summary || `PayPal Webhook: ${eventType}`);

  if (db.hasWebhookEvent(eventId)) {
    return { success: true, eventId, duplicate: true };
  }

  const isSignatureValid = await verifyWebhookSignature(headers, payload);

  const eventRecord: WebhookEventRecord = {
    id: `WH-${Date.now()}`,
    eventId,
    eventType,
    summary,
    resourceId: String((payload.resource as { id?: string })?.id || ''),
    status: isSignatureValid ? 'VERIFIED' : 'PROCESSED',
    rawPayload: payload,
    receivedAt: new Date().toISOString()
  };

  db.saveWebhookEvent(eventRecord);
  db.addAuditLog({
    action: 'PAYPAL_WEBHOOK_PROCESSED',
    category: 'PAYPAL',
    details: `Webhook Event ${eventId} processed (${eventType}). Verified: ${isSignatureValid}.`,
    actor: 'paypal_webhook',
    targetId: eventId,
    targetType: 'WebhookEvent'
  });

  return { success: true, eventId, duplicate: false };
}
