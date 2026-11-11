import fs from 'fs';
import path from 'path';
import {
  Customer,
  Invoice,
  Transaction,
  ReconciliationMatch,
  ReconciliationRun,
  AnomalyAlert,
  AIInvestigation,
  SettlementRecommendation,
  AuditLog,
  WebhookEventRecord
} from './types';

interface DatabaseSchema {
  customers: Customer[];
  invoices: Invoice[];
  transactions: Transaction[];
  reconciliationMatches: ReconciliationMatch[];
  reconciliationRuns: ReconciliationRun[];
  anomalies: AnomalyAlert[];
  aiInvestigations: AIInvestigation[];
  settlementRecommendations: SettlementRecommendation[];
  auditLogs: AuditLog[];
  webhookEvents: WebhookEventRecord[];
  lastUpdated: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'settlewise_store.json');

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function generateSeedData(): DatabaseSchema {
  const now = new Date('2026-11-11T00:00:00Z');
  const d = (daysAgo: number) => {
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return date.toISOString().split('T')[0];
  };

  const customers: Customer[] = [
    { id: 'CUST-001', name: 'Acme Corporation', email: 'billing@acme.corp', company: 'Acme Corp', paypalPayerId: 'PAYER-ACM-882' },
    { id: 'CUST-002', name: 'Starlight Tech Ltd', email: 'ap@starlight.io', company: 'Starlight Tech', paypalPayerId: 'PAYER-STL-193' },
    { id: 'CUST-003', name: 'Vanguard Media Group', email: 'finance@vanguardmedia.com', company: 'Vanguard Media', paypalPayerId: 'PAYER-VNG-402' },
    { id: 'CUST-004', name: 'Apex Logistics Inc', email: 'accounts@apexlogistics.net', company: 'Apex Logistics', paypalPayerId: 'PAYER-APX-771' },
    { id: 'CUST-005', name: 'BioGenix Labs', email: 'pay@biogenix.org', company: 'BioGenix Labs', paypalPayerId: 'PAYER-BIO-554' },
    { id: 'CUST-006', name: 'Quantum Cloud LLC', email: 'treasury@quantumcloud.co', company: 'Quantum Cloud', paypalPayerId: 'PAYER-QNT-908' },
    { id: 'CUST-007', name: 'Nexus Dynamic Works', email: 'invoicing@nexusdynamic.de', company: 'Nexus Dynamic', paypalPayerId: 'PAYER-NEX-339' },
    { id: 'CUST-008', name: 'Solaria Solar Systems', email: 'vendorpay@solaria.eu', company: 'Solaria Energy', paypalPayerId: 'PAYER-SOL-215' },
    { id: 'CUST-009', name: 'Elevate Retail Partners', email: 'billing@elevateretail.com', company: 'Elevate Retail', paypalPayerId: 'PAYER-ELV-629' },
    { id: 'CUST-010', name: 'Horizon Maritime Corp', email: 'finance@horizonmaritime.sg', company: 'Horizon Maritime', paypalPayerId: 'PAYER-HZN-811' }
  ];

  // 25 Invoices
  const invoices: Invoice[] = [
    {
      id: 'INV-1001',
      invoiceNumber: 'INV-2026-001',
      customerId: 'CUST-001',
      customerName: 'Acme Corporation',
      customerEmail: 'billing@acme.corp',
      amount: 4500.00,
      paidAmount: 4500.00,
      remainingAmount: 0.00,
      currency: 'USD',
      issueDate: d(28),
      dueDate: d(14),
      status: 'PAID',
      description: 'Enterprise Cloud Infrastructure Annual License',
      lineItems: [{ description: 'SaaS Platform License (Tier 3)', quantity: 1, unitPrice: 4500, total: 4500 }],
      createdAt: `${d(28)}T10:00:00Z`,
      updatedAt: `${d(12)}T14:30:00Z`
    },
    {
      id: 'INV-1002',
      invoiceNumber: 'INV-2026-002',
      customerId: 'CUST-002',
      customerName: 'Starlight Tech Ltd',
      customerEmail: 'ap@starlight.io',
      amount: 3200.00,
      paidAmount: 3200.00,
      remainingAmount: 0.00,
      currency: 'USD',
      issueDate: d(25),
      dueDate: d(10),
      status: 'PAID',
      description: 'Frontend Architecture Consulting & Review',
      lineItems: [{ description: 'Engineering Advisory Hours', quantity: 16, unitPrice: 200, total: 3200 }],
      createdAt: `${d(25)}T09:00:00Z`,
      updatedAt: `${d(8)}T11:15:00Z`
    },
    {
      id: 'INV-1003',
      invoiceNumber: 'INV-2026-003',
      customerId: 'CUST-003',
      customerName: 'Vanguard Media Group',
      customerEmail: 'finance@vanguardmedia.com',
      amount: 7850.00,
      paidAmount: 0.00,
      remainingAmount: 7850.00,
      currency: 'USD',
      issueDate: d(40),
      dueDate: d(10), // Overdue
      status: 'OVERDUE',
      description: 'Digital Video Syndication & CDN Distribution Q3',
      lineItems: [{ description: 'High-Bandwidth CDN Delivery Package', quantity: 1, unitPrice: 7850, total: 7850 }],
      createdAt: `${d(40)}T11:00:00Z`,
      updatedAt: `${d(40)}T11:00:00Z`
    },
    {
      id: 'INV-1004',
      invoiceNumber: 'INV-2026-004',
      customerId: 'CUST-004',
      customerName: 'Apex Logistics Inc',
      customerEmail: 'accounts@apexlogistics.net',
      amount: 6000.00,
      paidAmount: 3000.00, // Partial payment
      remainingAmount: 3000.00,
      currency: 'USD',
      issueDate: d(20),
      dueDate: d(5),
      status: 'PARTIALLY_PAID',
      description: 'Fleet Telematics Real-Time Tracking Integration',
      lineItems: [{ description: 'IoT Gateway Hardware and Protocol Connectors', quantity: 1, unitPrice: 6000, total: 6000 }],
      createdAt: `${d(20)}T08:30:00Z`,
      updatedAt: `${d(6)}T16:00:00Z`
    },
    {
      id: 'INV-1005',
      invoiceNumber: 'INV-2026-005',
      customerId: 'CUST-005',
      customerName: 'BioGenix Labs',
      customerEmail: 'pay@biogenix.org',
      amount: 9200.00,
      paidAmount: 9200.00,
      remainingAmount: 0.00,
      currency: 'USD',
      issueDate: d(18),
      dueDate: d(3),
      status: 'PAID',
      description: 'HIPAA Compliant Data Pipeline Deployment',
      lineItems: [{ description: 'Security Hardened Pipeline Implementation', quantity: 1, unitPrice: 9200, total: 9200 }],
      createdAt: `${d(18)}T13:45:00Z`,
      updatedAt: `${d(2)}T10:00:00Z`
    },
    {
      id: 'INV-1006',
      invoiceNumber: 'INV-2026-006',
      customerId: 'CUST-006',
      customerName: 'Quantum Cloud LLC',
      customerEmail: 'treasury@quantumcloud.co',
      amount: 1450.00,
      paidAmount: 0.00,
      remainingAmount: 1450.00,
      currency: 'USD',
      issueDate: d(12),
      dueDate: d(-18),
      status: 'UNPAID',
      description: 'API Gateway Usage & Microservice Mesh Routing',
      lineItems: [{ description: 'Monthly API Gateway Cluster', quantity: 1, unitPrice: 1450, total: 1450 }],
      createdAt: `${d(12)}T15:20:00Z`,
      updatedAt: `${d(12)}T15:20:00Z`
    },
    {
      id: 'INV-1007',
      invoiceNumber: 'INV-2026-007',
      customerId: 'CUST-007',
      customerName: 'Nexus Dynamic Works',
      customerEmail: 'invoicing@nexusdynamic.de',
      amount: 5120.00,
      paidAmount: 0.00,
      remainingAmount: 5120.00,
      currency: 'USD',
      issueDate: d(45),
      dueDate: d(15), // Overdue
      status: 'OVERDUE',
      description: 'Industrial Robotics Protocol Bridge',
      lineItems: [{ description: 'CANbus to OPC-UA Adapter Framework', quantity: 1, unitPrice: 5120, total: 5120 }],
      createdAt: `${d(45)}T14:10:00Z`,
      updatedAt: `${d(45)}T14:10:00Z`
    },
    {
      id: 'INV-1008',
      invoiceNumber: 'INV-2026-008',
      customerId: 'CUST-008',
      customerName: 'Solaria Solar Systems',
      customerEmail: 'vendorpay@solaria.eu',
      amount: 3800.00,
      paidAmount: 0.00,
      remainingAmount: 3800.00,
      currency: 'USD',
      issueDate: d(5),
      dueDate: d(-25),
      status: 'UNPAID',
      description: 'Photovoltaic Array Telemetry Dashboard',
      lineItems: [{ description: 'Monitoring Software Component Suite', quantity: 1, unitPrice: 3800, total: 3800 }],
      createdAt: `${d(5)}T11:00:00Z`,
      updatedAt: `${d(5)}T11:00:00Z`
    },
    {
      id: 'INV-1009',
      invoiceNumber: 'INV-2026-009',
      customerId: 'CUST-009',
      customerName: 'Elevate Retail Partners',
      customerEmail: 'billing@elevateretail.com',
      amount: 2750.00,
      paidAmount: 2750.00,
      remainingAmount: 0.00,
      currency: 'USD',
      issueDate: d(14),
      dueDate: d(-1),
      status: 'PAID',
      description: 'Omnichannel POS Synchronizer Service',
      lineItems: [{ description: 'Inventory POS Sync Relay', quantity: 1, unitPrice: 2750, total: 2750 }],
      createdAt: `${d(14)}T09:30:00Z`,
      updatedAt: `${d(3)}T15:00:00Z`
    },
    {
      id: 'INV-1010',
      invoiceNumber: 'INV-2026-010',
      customerId: 'CUST-010',
      customerName: 'Horizon Maritime Corp',
      customerEmail: 'finance@horizonmaritime.sg',
      amount: 12400.00,
      paidAmount: 0.00,
      remainingAmount: 12400.00,
      currency: 'USD',
      issueDate: d(7),
      dueDate: d(-23),
      status: 'UNPAID',
      description: 'Autonomous Vessel Navigational Mapping Core',
      lineItems: [{ description: 'Hydrographic Chart Processing Engine', quantity: 1, unitPrice: 12400, total: 12400 }],
      createdAt: `${d(7)}T10:15:00Z`,
      updatedAt: `${d(7)}T10:15:00Z`
    },
    {
      id: 'INV-1011',
      invoiceNumber: 'INV-2026-011',
      customerId: 'CUST-001',
      customerName: 'Acme Corporation',
      customerEmail: 'billing@acme.corp',
      amount: 2200.00,
      paidAmount: 0.00,
      remainingAmount: 2200.00,
      currency: 'USD',
      issueDate: d(4),
      dueDate: d(-26),
      status: 'UNPAID',
      description: 'Quarterly Security Audit & Penetration Review',
      lineItems: [{ description: 'Infra Vulnerability Testing', quantity: 1, unitPrice: 2200, total: 2200 }],
      createdAt: `${d(4)}T08:00:00Z`,
      updatedAt: `${d(4)}T08:00:00Z`
    },
    {
      id: 'INV-1012',
      invoiceNumber: 'INV-2026-012',
      customerId: 'CUST-002',
      customerName: 'Starlight Tech Ltd',
      customerEmail: 'ap@starlight.io',
      amount: 4100.00,
      paidAmount: 0.00,
      remainingAmount: 4100.00,
      currency: 'USD',
      issueDate: d(16),
      dueDate: d(1),
      status: 'UNPAID',
      description: 'Kubernetes Cluster Auto-scaling Automation',
      lineItems: [{ description: 'K8s Cluster Scaling Optimization', quantity: 1, unitPrice: 4100, total: 4100 }],
      createdAt: `${d(16)}T12:00:00Z`,
      updatedAt: `${d(16)}T12:00:00Z`
    },
    {
      id: 'INV-1013',
      invoiceNumber: 'INV-2026-013',
      customerId: 'CUST-003',
      customerName: 'Vanguard Media Group',
      customerEmail: 'finance@vanguardmedia.com',
      amount: 3600.00,
      paidAmount: 0.00,
      remainingAmount: 3600.00,
      currency: 'USD',
      issueDate: d(35),
      dueDate: d(5), // Overdue
      status: 'OVERDUE',
      description: 'Dynamic Ad Insertion Platform Maintenance',
      lineItems: [{ description: 'Ad Stitcher SCTE-35 Support', quantity: 1, unitPrice: 3600, total: 3600 }],
      createdAt: `${d(35)}T11:45:00Z`,
      updatedAt: `${d(35)}T11:45:00Z`
    },
    {
      id: 'INV-1014',
      invoiceNumber: 'INV-2026-014',
      customerId: 'CUST-004',
      customerName: 'Apex Logistics Inc',
      customerEmail: 'accounts@apexlogistics.net',
      amount: 5800.00,
      paidAmount: 5800.00,
      remainingAmount: 0.00,
      currency: 'USD',
      issueDate: d(22),
      dueDate: d(7),
      status: 'PAID',
      description: 'Cross-Border Customs Clearance Gateway',
      lineItems: [{ description: 'EDI Manifest Integration Engine', quantity: 1, unitPrice: 5800, total: 5800 }],
      createdAt: `${d(22)}T14:00:00Z`,
      updatedAt: `${d(8)}T13:20:00Z`
    },
    {
      id: 'INV-1015',
      invoiceNumber: 'INV-2026-015',
      customerId: 'CUST-005',
      customerName: 'BioGenix Labs',
      customerEmail: 'pay@biogenix.org',
      amount: 8400.00,
      paidAmount: 4200.00,
      remainingAmount: 4200.00,
      currency: 'USD',
      issueDate: d(15),
      dueDate: d(0),
      status: 'PARTIALLY_PAID',
      description: 'Genomics Sequencing File Transfer Protocol',
      lineItems: [{ description: 'High-throughput Aspera/FastQ Pipeline', quantity: 1, unitPrice: 8400, total: 8400 }],
      createdAt: `${d(15)}T16:00:00Z`,
      updatedAt: `${d(1)}T09:15:00Z`
    },
    {
      id: 'INV-1016',
      invoiceNumber: 'INV-2026-016',
      customerId: 'CUST-006',
      customerName: 'Quantum Cloud LLC',
      customerEmail: 'treasury@quantumcloud.co',
      amount: 2900.00,
      paidAmount: 0.00,
      remainingAmount: 2900.00,
      currency: 'USD',
      issueDate: d(9),
      dueDate: d(-21),
      status: 'UNPAID',
      description: 'Distributed Cache Cluster Node Provisioning',
      lineItems: [{ description: 'Redis Enterprise Nodes (x6)', quantity: 1, unitPrice: 2900, total: 2900 }],
      createdAt: `${d(9)}T10:00:00Z`,
      updatedAt: `${d(9)}T10:00:00Z`
    },
    {
      id: 'INV-1017',
      invoiceNumber: 'INV-2026-017',
      customerId: 'CUST-007',
      customerName: 'Nexus Dynamic Works',
      customerEmail: 'invoicing@nexusdynamic.de',
      amount: 6700.00,
      paidAmount: 6700.00,
      remainingAmount: 0.00,
      currency: 'USD',
      issueDate: d(30),
      dueDate: d(15),
      status: 'PAID',
      description: 'CNC Machine Edge Controller Firmware v4',
      lineItems: [{ description: 'Firmware Runtime Licences (Factory Pack)', quantity: 1, unitPrice: 6700, total: 6700 }],
      createdAt: `${d(30)}T11:20:00Z`,
      updatedAt: `${d(14)}T17:40:00Z`
    },
    {
      id: 'INV-1018',
      invoiceNumber: 'INV-2026-018',
      customerId: 'CUST-008',
      customerName: 'Solaria Solar Systems',
      customerEmail: 'vendorpay@solaria.eu',
      amount: 4950.00,
      paidAmount: 0.00,
      remainingAmount: 4950.00,
      currency: 'USD',
      issueDate: d(11),
      dueDate: d(-19),
      status: 'UNPAID',
      description: 'Inverter Grid Synchronization Telemetry',
      lineItems: [{ description: 'Smart Grid Protocol Telemetry Gateway', quantity: 1, unitPrice: 4950, total: 4950 }],
      createdAt: `${d(11)}T15:45:00Z`,
      updatedAt: `${d(11)}T15:45:00Z`
    },
    {
      id: 'INV-1019',
      invoiceNumber: 'INV-2026-019',
      customerId: 'CUST-009',
      customerName: 'Elevate Retail Partners',
      customerEmail: 'billing@elevateretail.com',
      amount: 1850.00,
      paidAmount: 0.00,
      remainingAmount: 1850.00,
      currency: 'USD',
      issueDate: d(6),
      dueDate: d(-24),
      status: 'UNPAID',
      description: 'Customer Loyalty Engine Webhook Connector',
      lineItems: [{ description: 'Loyalty Rewards Event Producer', quantity: 1, unitPrice: 1850, total: 1850 }],
      createdAt: `${d(6)}T13:30:00Z`,
      updatedAt: `${d(6)}T13:30:00Z`
    },
    {
      id: 'INV-1020',
      invoiceNumber: 'INV-2026-020',
      customerId: 'CUST-010',
      customerName: 'Horizon Maritime Corp',
      customerEmail: 'finance@horizonmaritime.sg',
      amount: 15800.00,
      paidAmount: 0.00,
      remainingAmount: 15800.00,
      currency: 'USD',
      issueDate: d(38),
      dueDate: d(8), // Overdue
      status: 'OVERDUE',
      description: 'Satellite AIS Ship Tracking Feed Q4',
      lineItems: [{ description: 'Global Satellite Maritime Feeds', quantity: 1, unitPrice: 15800, total: 15800 }],
      createdAt: `${d(38)}T09:00:00Z`,
      updatedAt: `${d(38)}T09:00:00Z`
    },
    {
      id: 'INV-1021',
      invoiceNumber: 'INV-2026-021',
      customerId: 'CUST-001',
      customerName: 'Acme Corporation',
      customerEmail: 'billing@acme.corp',
      amount: 3400.00,
      paidAmount: 3400.00,
      remainingAmount: 0.00,
      currency: 'USD',
      issueDate: d(19),
      dueDate: d(4),
      status: 'PAID',
      description: 'DevOps Pipeline CI/CD Runner Optimization',
      lineItems: [{ description: 'CI/CD Pipeline Architecture Review', quantity: 1, unitPrice: 3400, total: 3400 }],
      createdAt: `${d(19)}T14:15:00Z`,
      updatedAt: `${d(5)}T11:00:00Z`
    },
    {
      id: 'INV-1022',
      invoiceNumber: 'INV-2026-022',
      customerId: 'CUST-002',
      customerName: 'Starlight Tech Ltd',
      customerEmail: 'ap@starlight.io',
      amount: 5500.00,
      paidAmount: 0.00,
      remainingAmount: 5500.00,
      currency: 'USD',
      issueDate: d(8),
      dueDate: d(-22),
      status: 'UNPAID',
      description: 'GraphQL Federation Subgraph Router Deployment',
      lineItems: [{ description: 'Federated Supergraph Setup', quantity: 1, unitPrice: 5500, total: 5500 }],
      createdAt: `${d(8)}T16:20:00Z`,
      updatedAt: `${d(8)}T16:20:00Z`
    },
    {
      id: 'INV-1023',
      invoiceNumber: 'INV-2026-023',
      customerId: 'CUST-003',
      customerName: 'Vanguard Media Group',
      customerEmail: 'finance@vanguardmedia.com',
      amount: 4200.00,
      paidAmount: 0.00,
      remainingAmount: 4200.00,
      currency: 'USD',
      issueDate: d(2),
      dueDate: d(-28),
      status: 'UNPAID',
      description: 'Low-Latency HLS Transcoding Preset Tuning',
      lineItems: [{ description: 'HEVC / AV1 Transcoding Pipeline', quantity: 1, unitPrice: 4200, total: 4200 }],
      createdAt: `${d(2)}T10:45:00Z`,
      updatedAt: `${d(2)}T10:45:00Z`
    },
    {
      id: 'INV-1024',
      invoiceNumber: 'INV-2026-024',
      customerId: 'CUST-004',
      customerName: 'Apex Logistics Inc',
      customerEmail: 'accounts@apexlogistics.net',
      amount: 8100.00,
      paidAmount: 0.00,
      remainingAmount: 8100.00,
      currency: 'USD',
      issueDate: d(13),
      dueDate: d(-17),
      status: 'UNPAID',
      description: 'Automated Route Dispatching Optimization Engine',
      lineItems: [{ description: 'Vehicle Routing Solver Optimization', quantity: 1, unitPrice: 8100, total: 8100 }],
      createdAt: `${d(13)}T08:30:00Z`,
      updatedAt: `${d(13)}T08:30:00Z`
    },
    {
      id: 'INV-1025',
      invoiceNumber: 'INV-2026-025',
      customerId: 'CUST-005',
      customerName: 'BioGenix Labs',
      customerEmail: 'pay@biogenix.org',
      amount: 11500.00,
      paidAmount: 0.00,
      remainingAmount: 11500.00,
      currency: 'USD',
      issueDate: d(3),
      dueDate: d(-27),
      status: 'UNPAID',
      description: 'LIMS Electronic Laboratory Notebook Connector',
      lineItems: [{ description: 'Enterprise LIMS Connector Software', quantity: 1, unitPrice: 11500, total: 11500 }],
      createdAt: `${d(3)}T15:00:00Z`,
      updatedAt: `${d(3)}T15:00:00Z`
    }
  ];

  // 35 Transactions
  const transactions: Transaction[] = [
    // 1. Exact Match 1
    {
      id: 'TXN-2001',
      transactionId: 'PAYPAL-TXN-9001',
      paypalOrderId: 'ORD-882190-ACM',
      paypalCaptureId: 'CAP-77310-ACM',
      paypalReferenceId: 'REF-ACM-001',
      customerId: 'CUST-001',
      customerName: 'Acme Corporation',
      customerEmail: 'billing@acme.corp',
      amount: 4500.00,
      currency: 'USD',
      paymentDate: `${d(12)}T14:28:10Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Balance / Instant',
      invoiceReference: 'INV-2026-001',
      reconciliationStatus: 'RECONCILED',
      reconciliationScore: 98,
      matchedInvoiceId: 'INV-1001',
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'Payment for invoice INV-2026-001 by Acme Corp billing department',
      createdAt: `${d(12)}T14:28:10Z`,
      updatedAt: `${d(12)}T14:30:00Z`
    },
    // 2. Exact Match 2
    {
      id: 'TXN-2002',
      transactionId: 'PAYPAL-TXN-9002',
      paypalOrderId: 'ORD-543180-STL',
      paypalCaptureId: 'CAP-43190-STL',
      customerId: 'CUST-002',
      customerName: 'Starlight Tech Ltd',
      customerEmail: 'ap@starlight.io',
      amount: 3200.00,
      currency: 'USD',
      paymentDate: `${d(8)}T11:12:45Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Corporate Card',
      invoiceReference: 'INV-2026-002',
      reconciliationStatus: 'RECONCILED',
      reconciliationScore: 96,
      matchedInvoiceId: 'INV-1002',
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'Consulting services fee INV-2026-002 settled',
      createdAt: `${d(8)}T11:12:45Z`,
      updatedAt: `${d(8)}T11:15:00Z`
    },
    // 3. Partial Payment 1 for INV-1004
    {
      id: 'TXN-2003',
      transactionId: 'PAYPAL-TXN-9003',
      paypalOrderId: 'ORD-991204-APX',
      paypalCaptureId: 'CAP-88120-APX',
      customerId: 'CUST-004',
      customerName: 'Apex Logistics Inc',
      customerEmail: 'accounts@apexlogistics.net',
      amount: 3000.00,
      currency: 'USD',
      paymentDate: `${d(6)}T15:55:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Bank Debit',
      invoiceReference: 'INV-2026-004',
      reconciliationStatus: 'PARTIAL_MATCH',
      reconciliationScore: 84,
      matchedInvoiceId: 'INV-1004',
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'Part 1 of 2 payment for fleet telematics INV-2026-004',
      createdAt: `${d(6)}T15:55:00Z`,
      updatedAt: `${d(6)}T16:00:00Z`
    },
    // 4. Exact Match 3
    {
      id: 'TXN-2004',
      transactionId: 'PAYPAL-TXN-9004',
      paypalOrderId: 'ORD-667102-BIO',
      paypalCaptureId: 'CAP-55610-BIO',
      customerId: 'CUST-005',
      customerName: 'BioGenix Labs',
      customerEmail: 'pay@biogenix.org',
      amount: 9200.00,
      currency: 'USD',
      paymentDate: `${d(2)}T09:58:30Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Business Account',
      invoiceReference: 'INV-2026-005',
      reconciliationStatus: 'RECONCILED',
      reconciliationScore: 99,
      matchedInvoiceId: 'INV-1005',
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'Full payment for HIPAA data pipeline INV-2026-005',
      createdAt: `${d(2)}T09:58:30Z`,
      updatedAt: `${d(2)}T10:00:00Z`
    },
    // 5. Exact Match 4
    {
      id: 'TXN-2005',
      transactionId: 'PAYPAL-TXN-9005',
      paypalOrderId: 'ORD-332190-ELV',
      paypalCaptureId: 'CAP-22108-ELV',
      customerId: 'CUST-009',
      customerName: 'Elevate Retail Partners',
      customerEmail: 'billing@elevateretail.com',
      amount: 2750.00,
      currency: 'USD',
      paymentDate: `${d(3)}T14:50:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Instant Transfer',
      invoiceReference: 'INV-2026-009',
      reconciliationStatus: 'RECONCILED',
      reconciliationScore: 97,
      matchedInvoiceId: 'INV-1009',
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'Omnichannel POS sync payment',
      createdAt: `${d(3)}T14:50:00Z`,
      updatedAt: `${d(3)}T15:00:00Z`
    },
    // 6. Exact Match 5
    {
      id: 'TXN-2006',
      transactionId: 'PAYPAL-TXN-9006',
      paypalOrderId: 'ORD-771240-APX',
      paypalCaptureId: 'CAP-66190-APX',
      customerId: 'CUST-004',
      customerName: 'Apex Logistics Inc',
      customerEmail: 'accounts@apexlogistics.net',
      amount: 5800.00,
      currency: 'USD',
      paymentDate: `${d(8)}T13:10:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Corporate Card',
      invoiceReference: 'INV-2026-014',
      reconciliationStatus: 'RECONCILED',
      reconciliationScore: 98,
      matchedInvoiceId: 'INV-1014',
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'Payment for cross-border gateway INV-2026-014',
      createdAt: `${d(8)}T13:10:00Z`,
      updatedAt: `${d(8)}T13:20:00Z`
    },
    // 7. Partial Payment for INV-1015
    {
      id: 'TXN-2007',
      transactionId: 'PAYPAL-TXN-9007',
      paypalOrderId: 'ORD-812030-BIO',
      paypalCaptureId: 'CAP-70192-BIO',
      customerId: 'CUST-005',
      customerName: 'BioGenix Labs',
      customerEmail: 'pay@biogenix.org',
      amount: 4200.00,
      currency: 'USD',
      paymentDate: `${d(1)}T09:10:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Business Account',
      invoiceReference: 'INV-2026-015',
      reconciliationStatus: 'PARTIAL_MATCH',
      reconciliationScore: 82,
      matchedInvoiceId: 'INV-1015',
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'Installment 1 of 2 for Genomics pipeline (total $8,400)',
      createdAt: `${d(1)}T09:10:00Z`,
      updatedAt: `${d(1)}T09:15:00Z`
    },
    // 8. Exact Match 6
    {
      id: 'TXN-2008',
      transactionId: 'PAYPAL-TXN-9008',
      paypalOrderId: 'ORD-441920-NEX',
      paypalCaptureId: 'CAP-33019-NEX',
      customerId: 'CUST-007',
      customerName: 'Nexus Dynamic Works',
      customerEmail: 'invoicing@nexusdynamic.de',
      amount: 6700.00,
      currency: 'USD',
      paymentDate: `${d(14)}T17:35:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal SEPA Wire Transfer',
      invoiceReference: 'INV-2026-017',
      reconciliationStatus: 'RECONCILED',
      reconciliationScore: 95,
      matchedInvoiceId: 'INV-1017',
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'CNC machine edge controller firmware payment',
      createdAt: `${d(14)}T17:35:00Z`,
      updatedAt: `${d(14)}T17:40:00Z`
    },
    // 9. Exact Match 7
    {
      id: 'TXN-2009',
      transactionId: 'PAYPAL-TXN-9009',
      paypalOrderId: 'ORD-119280-ACM',
      paypalCaptureId: 'CAP-00819-ACM',
      customerId: 'CUST-001',
      customerName: 'Acme Corporation',
      customerEmail: 'billing@acme.corp',
      amount: 3400.00,
      currency: 'USD',
      paymentDate: `${d(5)}T10:55:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Balance',
      invoiceReference: 'INV-2026-021',
      reconciliationStatus: 'RECONCILED',
      reconciliationScore: 98,
      matchedInvoiceId: 'INV-1021',
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'DevOps CI/CD optimization payment',
      createdAt: `${d(5)}T10:55:00Z`,
      updatedAt: `${d(5)}T11:00:00Z`
    },
    // 10. UNMATCHED TRANSACTION 1 (Missing invoice ref, unknown memo)
    {
      id: 'TXN-2010',
      transactionId: 'PAYPAL-TXN-9010',
      paypalOrderId: 'ORD-980122-UNK',
      paypalCaptureId: 'CAP-87001-UNK',
      customerName: 'Global Transmit Logistics',
      customerEmail: 'ops@globaltransmit.co.uk',
      amount: 5120.00,
      currency: 'USD',
      paymentDate: `${d(3)}T16:20:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Direct Debit',
      reconciliationStatus: 'UNMATCHED',
      reconciliationScore: 42,
      riskIndicator: 'MEDIUM',
      source: 'DEMO',
      notes: 'Payment received with memo "Logistics settlement Q4" - no customer match in ledger',
      createdAt: `${d(3)}T16:20:00Z`,
      updatedAt: `${d(3)}T16:20:00Z`
    },
    // 11. UNMATCHED TRANSACTION 2 (Amount mismatch candidate for INV-1006)
    {
      id: 'TXN-2011',
      transactionId: 'PAYPAL-TXN-9011',
      paypalOrderId: 'ORD-654321-QNT',
      paypalCaptureId: 'CAP-543210-QNT',
      customerId: 'CUST-006',
      customerName: 'Quantum Cloud LLC',
      customerEmail: 'treasury@quantumcloud.co',
      amount: 1400.00, // Invoice INV-1006 is 1450.00 -> $50 underpayment
      currency: 'USD',
      paymentDate: `${d(2)}T11:30:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Corporate Balance',
      invoiceReference: 'INV-2026-006',
      reconciliationStatus: 'MANUAL_REVIEW',
      reconciliationScore: 78,
      matchedInvoiceId: 'INV-1006',
      riskIndicator: 'MEDIUM',
      source: 'DEMO',
      notes: 'Underpayment of $50.00 detected ($1,400.00 paid vs $1,450.00 invoice balance)',
      createdAt: `${d(2)}T11:30:00Z`,
      updatedAt: `${d(2)}T11:30:00Z`
    },
    // 12. DUPLICATE PAYMENT CANDIDATE A
    {
      id: 'TXN-2012',
      transactionId: 'PAYPAL-TXN-9012',
      paypalOrderId: 'ORD-220199-BIO',
      paypalCaptureId: 'CAP-110088-BIO',
      customerId: 'CUST-005',
      customerName: 'BioGenix Labs',
      customerEmail: 'pay@biogenix.org',
      amount: 4200.00,
      currency: 'USD',
      paymentDate: `${d(1)}T09:12:15Z`, // 2 minutes after TXN-2007!
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Business Account',
      invoiceReference: 'INV-2026-015',
      reconciliationStatus: 'MANUAL_REVIEW',
      reconciliationScore: 74,
      riskIndicator: 'HIGH',
      source: 'DEMO',
      notes: 'Potential duplicate payment alert: identical amount $4,200 from BioGenix Labs 2 minutes after TXN-2007',
      createdAt: `${d(1)}T09:12:15Z`,
      updatedAt: `${d(1)}T09:12:15Z`
    },
    // 13. UNMATCHED TRANSACTION 3 (Currency mismatch anomaly)
    {
      id: 'TXN-2013',
      transactionId: 'PAYPAL-TXN-9013',
      paypalOrderId: 'ORD-774411-SOL',
      paypalCaptureId: 'CAP-663300-SOL',
      customerId: 'CUST-008',
      customerName: 'Solaria Solar Systems',
      customerEmail: 'vendorpay@solaria.eu',
      amount: 3800.00,
      currency: 'EUR', // Currency mismatch: invoice is in USD!
      paymentDate: `${d(2)}T14:45:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal International',
      invoiceReference: 'INV-2026-008',
      reconciliationStatus: 'MANUAL_REVIEW',
      reconciliationScore: 71,
      matchedInvoiceId: 'INV-1008',
      riskIndicator: 'HIGH',
      source: 'DEMO',
      notes: 'Currency discrepancy: received 3,800.00 EUR for USD invoice INV-2026-008',
      createdAt: `${d(2)}T14:45:00Z`,
      updatedAt: `${d(2)}T14:45:00Z`
    },
    // 14. PENDING TRANSACTION
    {
      id: 'TXN-2014',
      transactionId: 'PAYPAL-TXN-9014',
      paypalOrderId: 'ORD-338811-ELV',
      customerId: 'CUST-009',
      customerName: 'Elevate Retail Partners',
      customerEmail: 'billing@elevateretail.com',
      amount: 1850.00,
      currency: 'USD',
      paymentDate: `${d(0)}T18:10:00Z`,
      paymentStatus: 'PENDING',
      paymentMethod: 'PayPal eCheck',
      invoiceReference: 'INV-2026-019',
      reconciliationStatus: 'UNMATCHED',
      reconciliationScore: 68,
      matchedInvoiceId: 'INV-1019',
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'Pending PayPal eCheck clearing in 2-3 business days',
      createdAt: `${d(0)}T18:10:00Z`,
      updatedAt: `${d(0)}T18:10:00Z`
    },
    // 15. REPEATED FAILED ATTEMPTS 1
    {
      id: 'TXN-2015',
      transactionId: 'PAYPAL-TXN-9015',
      paypalOrderId: 'ORD-101010-HZN',
      customerId: 'CUST-010',
      customerName: 'Horizon Maritime Corp',
      customerEmail: 'finance@horizonmaritime.sg',
      amount: 12400.00,
      currency: 'USD',
      paymentDate: `${d(4)}T03:15:00Z`,
      paymentStatus: 'FAILED',
      paymentMethod: 'PayPal Business Card',
      invoiceReference: 'INV-2026-010',
      reconciliationStatus: 'REJECTED',
      reconciliationScore: 30,
      riskIndicator: 'HIGH',
      source: 'DEMO',
      notes: 'Card authorization failed: INSTRUMENT_DECLINED (attempt 1 of 3)',
      createdAt: `${d(4)}T03:15:00Z`,
      updatedAt: `${d(4)}T03:15:00Z`
    },
    // 16. REPEATED FAILED ATTEMPTS 2
    {
      id: 'TXN-2016',
      transactionId: 'PAYPAL-TXN-9016',
      paypalOrderId: 'ORD-101011-HZN',
      customerId: 'CUST-010',
      customerName: 'Horizon Maritime Corp',
      customerEmail: 'finance@horizonmaritime.sg',
      amount: 12400.00,
      currency: 'USD',
      paymentDate: `${d(4)}T03:22:00Z`,
      paymentStatus: 'FAILED',
      paymentMethod: 'PayPal Backup Card',
      invoiceReference: 'INV-2026-010',
      reconciliationStatus: 'REJECTED',
      reconciliationScore: 30,
      riskIndicator: 'HIGH',
      source: 'DEMO',
      notes: 'Card authorization failed: INSUFFICIENT_FUNDS (attempt 2 of 3)',
      createdAt: `${d(4)}T03:22:00Z`,
      updatedAt: `${d(4)}T03:22:00Z`
    },
    // 17. REPEATED FAILED ATTEMPTS 3
    {
      id: 'TXN-2017',
      transactionId: 'PAYPAL-TXN-9017',
      paypalOrderId: 'ORD-101012-HZN',
      customerId: 'CUST-010',
      customerName: 'Horizon Maritime Corp',
      customerEmail: 'finance@horizonmaritime.sg',
      amount: 12400.00,
      currency: 'USD',
      paymentDate: `${d(4)}T03:40:00Z`,
      paymentStatus: 'FAILED',
      paymentMethod: 'PayPal Wire Transfer',
      invoiceReference: 'INV-2026-010',
      reconciliationStatus: 'REJECTED',
      reconciliationScore: 30,
      riskIndicator: 'HIGH',
      source: 'DEMO',
      notes: 'Transaction aborted by payer institution (attempt 3 of 3)',
      createdAt: `${d(4)}T03:40:00Z`,
      updatedAt: `${d(4)}T03:40:00Z`
    },
    // 18. UNMATCHED TRANSACTION 4 (Unusual Large Amount)
    {
      id: 'TXN-2018',
      transactionId: 'PAYPAL-TXN-9018',
      paypalOrderId: 'ORD-999888-UNK',
      paypalCaptureId: 'CAP-888777-UNK',
      customerName: 'Apex Sovereign Wealth Group',
      customerEmail: 'investments@apexwealth.ch',
      amount: 45000.00, // Spike: 10x normal max
      currency: 'USD',
      paymentDate: `${d(5)}T19:00:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Wire Integration',
      reconciliationStatus: 'UNMATCHED',
      reconciliationScore: 15,
      riskIndicator: 'HIGH',
      source: 'DEMO',
      notes: 'Unusually large payment volume ($45,000.00) without registered invoice reference or purchase contract',
      createdAt: `${d(5)}T19:00:00Z`,
      updatedAt: `${d(5)}T19:00:00Z`
    },
    // 19. EXACT MATCH 8 (Sandbox transaction example)
    {
      id: 'TXN-2019',
      transactionId: 'PAYPAL-TXN-9019',
      paypalOrderId: 'ORD-SANDBOX-7821',
      paypalCaptureId: 'CAP-SANDBOX-1982',
      customerId: 'CUST-001',
      customerName: 'Acme Corporation',
      customerEmail: 'billing@acme.corp',
      amount: 2200.00,
      currency: 'USD',
      paymentDate: `${d(1)}T12:00:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Sandbox Payer Account',
      invoiceReference: 'INV-2026-011',
      reconciliationStatus: 'EXACT_MATCH',
      reconciliationScore: 96,
      matchedInvoiceId: 'INV-1011',
      riskIndicator: 'LOW',
      source: 'SANDBOX',
      notes: 'Verified PayPal Sandbox payment capture for security audit invoice INV-2026-011',
      createdAt: `${d(1)}T12:00:00Z`,
      updatedAt: `${d(1)}T12:00:00Z`
    },
    // 20. UNMATCHED TRANSACTION 5
    {
      id: 'TXN-2020',
      transactionId: 'PAYPAL-TXN-9020',
      paypalOrderId: 'ORD-554433-UNK',
      paypalCaptureId: 'CAP-443322-UNK',
      customerName: 'Veloce Digital Media',
      customerEmail: 'accounting@velocedigital.it',
      amount: 3600.00,
      currency: 'USD',
      paymentDate: `${d(7)}T10:15:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Commercial Card',
      reconciliationStatus: 'MANUAL_REVIEW',
      reconciliationScore: 64,
      riskIndicator: 'MEDIUM',
      source: 'DEMO',
      notes: 'Matches amount ($3,600) of overdue invoice INV-2026-013 but payer entity does not match Vanguard Media',
      createdAt: `${d(7)}T10:15:00Z`,
      updatedAt: `${d(7)}T10:15:00Z`
    },
    // 21. OVERPAYMENT ANOMALY
    {
      id: 'TXN-2021',
      transactionId: 'PAYPAL-TXN-9021',
      paypalOrderId: 'ORD-123456-QNT',
      paypalCaptureId: 'CAP-234567-QNT',
      customerId: 'CUST-006',
      customerName: 'Quantum Cloud LLC',
      customerEmail: 'treasury@quantumcloud.co',
      amount: 3100.00, // Invoice INV-1016 is 2900.00 -> $200 overpayment!
      currency: 'USD',
      paymentDate: `${d(2)}T13:40:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Balance',
      invoiceReference: 'INV-2026-016',
      reconciliationStatus: 'MANUAL_REVIEW',
      reconciliationScore: 81,
      matchedInvoiceId: 'INV-1016',
      riskIndicator: 'MEDIUM',
      source: 'DEMO',
      notes: 'Overpayment anomaly: received $3,100.00 against invoice amount $2,900.00 (+$200 excess)',
      createdAt: `${d(2)}T13:40:00Z`,
      updatedAt: `${d(2)}T13:40:00Z`
    },
    // 22. HELD PAYMENT
    {
      id: 'TXN-2022',
      transactionId: 'PAYPAL-TXN-9022',
      paypalOrderId: 'ORD-876543-STL',
      paypalCaptureId: 'CAP-987654-STL',
      customerId: 'CUST-002',
      customerName: 'Starlight Tech Ltd',
      customerEmail: 'ap@starlight.io',
      amount: 4100.00,
      currency: 'USD',
      paymentDate: `${d(3)}T15:20:00Z`,
      paymentStatus: 'HELD',
      paymentMethod: 'PayPal Escrow Verification',
      invoiceReference: 'INV-2026-012',
      reconciliationStatus: 'MANUAL_REVIEW',
      reconciliationScore: 75,
      matchedInvoiceId: 'INV-1012',
      riskIndicator: 'HIGH',
      source: 'DEMO',
      notes: 'PayPal Risk Engine security hold: funds awaiting 21-day verification or proof of fulfillment',
      createdAt: `${d(3)}T15:20:00Z`,
      updatedAt: `${d(3)}T15:20:00Z`
    },
    // 23-35: Additional varied records
    {
      id: 'TXN-2023',
      transactionId: 'PAYPAL-TXN-9023',
      paypalOrderId: 'ORD-667788-APX',
      paypalCaptureId: 'CAP-778899-APX',
      customerId: 'CUST-004',
      customerName: 'Apex Logistics Inc',
      customerEmail: 'accounts@apexlogistics.net',
      amount: 8100.00,
      currency: 'USD',
      paymentDate: `${d(1)}T17:00:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Bank Account',
      invoiceReference: 'INV-2026-024',
      reconciliationStatus: 'EXACT_MATCH',
      reconciliationScore: 97,
      matchedInvoiceId: 'INV-1024',
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'Automated dispatching engine license payment',
      createdAt: `${d(1)}T17:00:00Z`,
      updatedAt: `${d(1)}T17:00:00Z`
    },
    {
      id: 'TXN-2024',
      transactionId: 'PAYPAL-TXN-9024',
      paypalOrderId: 'ORD-445566-STL',
      paypalCaptureId: 'CAP-556677-STL',
      customerId: 'CUST-002',
      customerName: 'Starlight Tech Ltd',
      customerEmail: 'ap@starlight.io',
      amount: 5500.00,
      currency: 'USD',
      paymentDate: `${d(2)}T08:45:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Instant',
      invoiceReference: 'INV-2026-022',
      reconciliationStatus: 'EXACT_MATCH',
      reconciliationScore: 99,
      matchedInvoiceId: 'INV-1022',
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'GraphQL router setup payment',
      createdAt: `${d(2)}T08:45:00Z`,
      updatedAt: `${d(2)}T08:45:00Z`
    },
    {
      id: 'TXN-2025',
      transactionId: 'PAYPAL-TXN-9025',
      paypalOrderId: 'ORD-112233-SOL',
      paypalCaptureId: 'CAP-223344-SOL',
      customerId: 'CUST-008',
      customerName: 'Solaria Solar Systems',
      customerEmail: 'vendorpay@solaria.eu',
      amount: 4950.00,
      currency: 'USD',
      paymentDate: `${d(3)}T11:20:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Corporate Balance',
      invoiceReference: 'INV-2026-018',
      reconciliationStatus: 'EXACT_MATCH',
      reconciliationScore: 98,
      matchedInvoiceId: 'INV-1018',
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'Inverter telemetry system settlement',
      createdAt: `${d(3)}T11:20:00Z`,
      updatedAt: `${d(3)}T11:20:00Z`
    },
    {
      id: 'TXN-2026',
      transactionId: 'PAYPAL-TXN-9026',
      customerName: 'MicroSystems Cloud UK',
      customerEmail: 'finance@microsystems.co.uk',
      amount: 750.00,
      currency: 'USD',
      paymentDate: `${d(6)}T14:10:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Express Checkout',
      reconciliationStatus: 'UNMATCHED',
      reconciliationScore: 22,
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'Direct microservice subscription charge - no corresponding invoice generated',
      createdAt: `${d(6)}T14:10:00Z`,
      updatedAt: `${d(6)}T14:10:00Z`
    },
    {
      id: 'TXN-2027',
      transactionId: 'PAYPAL-TXN-9027',
      customerName: 'AeroData Aviation Ltd',
      customerEmail: 'treasury@aerodata.aero',
      amount: 980.00,
      currency: 'USD',
      paymentDate: `${d(9)}T11:00:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Card Processing',
      reconciliationStatus: 'UNMATCHED',
      reconciliationScore: 20,
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'Flight telemetry data export fee',
      createdAt: `${d(9)}T11:00:00Z`,
      updatedAt: `${d(9)}T11:00:00Z`
    },
    {
      id: 'TXN-2028',
      transactionId: 'PAYPAL-TXN-9028',
      customerId: 'CUST-003',
      customerName: 'Vanguard Media Group',
      customerEmail: 'finance@vanguardmedia.com',
      amount: 4200.00,
      currency: 'USD',
      paymentDate: `${d(1)}T15:30:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Business Wire',
      invoiceReference: 'INV-2026-023',
      reconciliationStatus: 'EXACT_MATCH',
      reconciliationScore: 97,
      matchedInvoiceId: 'INV-1023',
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'Transcoding preset settlement',
      createdAt: `${d(1)}T15:30:00Z`,
      updatedAt: `${d(1)}T15:30:00Z`
    },
    {
      id: 'TXN-2029',
      transactionId: 'PAYPAL-TXN-9029',
      customerName: 'Dr. Raymond Zhao',
      customerEmail: 'rzhao@biotech-advisors.com',
      amount: 350.00,
      currency: 'USD',
      paymentDate: `${d(10)}T16:45:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Personal Account',
      reconciliationStatus: 'UNMATCHED',
      reconciliationScore: 18,
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'Advisory consultation ticket #812',
      createdAt: `${d(10)}T16:45:00Z`,
      updatedAt: `${d(10)}T16:45:00Z`
    },
    {
      id: 'TXN-2030',
      transactionId: 'PAYPAL-TXN-9030',
      customerId: 'CUST-005',
      customerName: 'BioGenix Labs',
      customerEmail: 'pay@biogenix.org',
      amount: 11500.00,
      currency: 'USD',
      paymentDate: `${d(0)}T14:10:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Enterprise Debit',
      invoiceReference: 'INV-2026-025',
      reconciliationStatus: 'EXACT_MATCH',
      reconciliationScore: 99,
      matchedInvoiceId: 'INV-1025',
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'LIMS Connector license settlement',
      createdAt: `${d(0)}T14:10:00Z`,
      updatedAt: `${d(0)}T14:10:00Z`
    },
    {
      id: 'TXN-2031',
      transactionId: 'PAYPAL-TXN-9031',
      customerName: 'Atlas Engineering GmbH',
      customerEmail: 'billing@atlas-eng.de',
      amount: 1250.00,
      currency: 'USD',
      paymentDate: `${d(12)}T09:30:00Z`,
      paymentStatus: 'REFUNDED',
      paymentMethod: 'PayPal Commercial Card',
      reconciliationStatus: 'RECONCILED',
      reconciliationScore: 88,
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'Refunded evaluation prototype deposit',
      createdAt: `${d(12)}T09:30:00Z`,
      updatedAt: `${d(10)}T11:00:00Z`
    },
    {
      id: 'TXN-2032',
      transactionId: 'PAYPAL-TXN-9032',
      customerName: 'Pacific Rim Robotics',
      customerEmail: 'support@pacrimrobotics.jp',
      amount: 620.00,
      currency: 'USD',
      paymentDate: `${d(15)}T04:20:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Balance',
      reconciliationStatus: 'UNMATCHED',
      reconciliationScore: 25,
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'Firmware calibration patch access pass',
      createdAt: `${d(15)}T04:20:00Z`,
      updatedAt: `${d(15)}T04:20:00Z`
    },
    {
      id: 'TXN-2033',
      transactionId: 'PAYPAL-TXN-9033',
      customerId: 'CUST-009',
      customerName: 'Elevate Retail Partners',
      customerEmail: 'billing@elevateretail.com',
      amount: 520.00,
      currency: 'USD',
      paymentDate: `${d(11)}T18:00:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Balance',
      reconciliationStatus: 'UNMATCHED',
      reconciliationScore: 31,
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'Additional monthly POS webhook egress quota',
      createdAt: `${d(11)}T18:00:00Z`,
      updatedAt: `${d(11)}T18:00:00Z`
    },
    {
      id: 'TXN-2034',
      transactionId: 'PAYPAL-TXN-9034',
      customerName: 'Cortex Data Systems',
      customerEmail: 'ap@cortexdata.io',
      amount: 1950.00,
      currency: 'USD',
      paymentDate: `${d(13)}T13:40:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Express',
      reconciliationStatus: 'UNMATCHED',
      reconciliationScore: 35,
      riskIndicator: 'LOW',
      source: 'DEMO',
      notes: 'Quarterly analytics telemetry connector',
      createdAt: `${d(13)}T13:40:00Z`,
      updatedAt: `${d(13)}T13:40:00Z`
    },
    {
      id: 'TXN-2035',
      transactionId: 'PAYPAL-TXN-9035',
      customerId: 'CUST-007',
      customerName: 'Nexus Dynamic Works',
      customerEmail: 'invoicing@nexusdynamic.de',
      amount: 5120.00,
      currency: 'USD',
      paymentDate: `${d(0)}T16:50:00Z`,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'PayPal Wire Transfer',
      invoiceReference: 'INV-2026-007',
      reconciliationStatus: 'EXACT_MATCH',
      reconciliationScore: 99,
      matchedInvoiceId: 'INV-1007',
      riskIndicator: 'LOW',
      source: 'SANDBOX',
      notes: 'Settlement for overdue robotics protocol bridge INV-2026-007 via PayPal Sandbox',
      createdAt: `${d(0)}T16:50:00Z`,
      updatedAt: `${d(0)}T16:50:00Z`
    }
  ];

  // Anomalies
  const anomalies: AnomalyAlert[] = [
    {
      id: 'ANOM-001',
      type: 'DUPLICATE_PAYMENT',
      severity: 'CRITICAL',
      transactionId: 'TXN-2012',
      invoiceId: 'INV-1015',
      title: 'Potential Duplicate Payment Detected: $4,200.00 from BioGenix Labs',
      description: 'Transaction TXN-2012 was captured 2 minutes after TXN-2007 with identical amount ($4,200.00), identical customer, and identical invoice reference INV-2026-015.',
      evidence: [
        'Matching amount: $4,200.00 across both transactions',
        'Time delta: 135 seconds between captures',
        'Same PayPal Payer ID: PAYER-BIO-554',
        'Invoice INV-2026-015 total was only $8,400 with $4,200 expected balance'
      ],
      aiExplanation: 'Heuristic pattern matches client-side double-submission or automated retry race condition. The second transaction creates an unintended over-collection risk.',
      suggestedResolution: 'Hold TXN-2012 funds and initiate human review to execute a void or partial refund to BioGenix Labs via PayPal Sandbox.',
      status: 'OPEN',
      detectedAt: `${d(1)}T09:15:00Z`
    },
    {
      id: 'ANOM-002',
      type: 'UNUSUAL_AMOUNT',
      severity: 'HIGH',
      transactionId: 'TXN-2018',
      title: 'Unusually Large Transaction Spike: $45,000.00 from Apex Sovereign Wealth',
      description: 'Transaction amount ($45,000.00) is 6.8x higher than the 95th percentile historical transaction ($6,600.00) and has no matching customer invoice in the ledger.',
      evidence: [
        'Captured Amount: $45,000.00 USD',
        'Historical Mean: $4,820.00 (Std Dev: $2,410.00)',
        'Unregistered customer email domain: @apexwealth.ch',
        'No invoice reference provided in memo'
      ],
      aiExplanation: 'Spike anomaly flags potential unallocated escrow transfer or misrouted institutional payment. Requires manual attribution before clearing to revenue.',
      suggestedResolution: 'Create manual ledger record or contact Apex Sovereign Wealth to allocate funds to upcoming project contract.',
      status: 'OPEN',
      detectedAt: `${d(5)}T19:05:00Z`
    },
    {
      id: 'ANOM-003',
      type: 'CURRENCY_MISMATCH',
      severity: 'HIGH',
      transactionId: 'TXN-2013',
      invoiceId: 'INV-1008',
      title: 'Currency Discrepancy: Received 3,800.00 EUR for USD 3,800.00 Invoice',
      description: 'Invoice INV-2026-008 is denominated in USD ($3,800.00), but payment TXN-2013 was settled in EUR (€3,800.00), creating foreign exchange exposure and a valuation surplus.',
      evidence: [
        'Invoice Currency: USD ($3,800.00)',
        'Settled Currency: EUR (€3,800.00)',
        'Current FX Rate: 1.08 USD/EUR creates an excess collection of ~$304 USD',
        'Payer: Solaria Solar Systems (vendorpay@solaria.eu)'
      ],
      aiExplanation: 'Payer transferred numerical amount without FX conversion. Invoice cannot be mathematically closed cleanly without adjusting for the FX gain/surplus.',
      suggestedResolution: 'Record FX gain of $304.00, credit invoice INV-2026-008 as paid in full, and issue credit note or refund for surplus.',
      status: 'OPEN',
      detectedAt: `${d(2)}T14:50:00Z`
    },
    {
      id: 'ANOM-004',
      type: 'REPEATED_FAILED_ATTEMPTS',
      severity: 'MEDIUM',
      transactionId: 'TXN-2017',
      invoiceId: 'INV-1010',
      title: 'Repeated Failed Payment Attempts (3x) for Horizon Maritime Corp',
      description: 'Three consecutive payment attempts for $12,400.00 (TXN-2015, TXN-2016, TXN-2017) failed within 25 minutes due to card decline and insufficient balance.',
      evidence: [
        'Attempt 1: INSTRUMENT_DECLINED at 03:15 UTC',
        'Attempt 2: INSUFFICIENT_FUNDS at 03:22 UTC',
        'Attempt 3: TRANSACTION_REFUSED at 03:40 UTC',
        'Invoice INV-2026-010 remains completely unpaid'
      ],
      aiExplanation: 'Automated payment gateway failures indicate banking limits or insufficient working capital. Further automatic retries may trigger PayPal fraud blocks on the buyer account.',
      suggestedResolution: 'Pause automated retries. Trigger account manager notification to send Horizon Maritime wire transfer coordinates.',
      status: 'OPEN',
      detectedAt: `${d(4)}T03:45:00Z`
    },
    {
      id: 'ANOM-005',
      type: 'INVOICE_DISCREPANCY',
      severity: 'MEDIUM',
      transactionId: 'TXN-2011',
      invoiceId: 'INV-1006',
      title: 'Underpayment Discrepancy: $1,400.00 paid on $1,450.00 Invoice ($50 short)',
      description: 'Quantum Cloud LLC submitted payment TXN-2011 referencing INV-2026-006, but the payment amount was $1,400.00 instead of the billed $1,450.00.',
      evidence: [
        'Billed Amount: $1,450.00 USD',
        'Paid Amount: $1,400.00 USD',
        'Variance: -$50.00 USD (3.4% discrepancy)',
        'Reference: INV-2026-006'
      ],
      aiExplanation: 'Common withholding fee or bank wire transfer deduction by intermediary institution. The $50 difference leaves the invoice in an open partial state.',
      suggestedResolution: 'Review if $50 represents acceptable banking wire processing fee to write off, or generate balance-due reminder for $50.00.',
      status: 'OPEN',
      detectedAt: `${d(2)}T11:35:00Z`
    }
  ];

  // Settlement Recommendations (Human Approval Workflow)
  const settlementRecommendations: SettlementRecommendation[] = [
    {
      id: 'SETTLE-001',
      actionType: 'VOID_DUPLICATE',
      title: 'Refund Duplicate Payment $4,200.00 to BioGenix Labs',
      description: 'Transaction TXN-2012 has been validated as an accidental double charge for invoice INV-2026-015. Requires explicit CFO approval before invoking PayPal Sandbox refund endpoint.',
      transactionId: 'TXN-2012',
      invoiceId: 'INV-1015',
      amount: 4200.00,
      currency: 'USD',
      aiRationale: 'Confidence: 96%. TXN-2007 already covered the $4,200 installment. Holding TXN-2012 risks chargeback dispute fees ($15) on PayPal.',
      riskAssessment: 'Low financial risk. Direct reversal to original payment source (PayPal Business account pay@biogenix.org).',
      approvalStatus: 'PENDING_APPROVAL',
      createdAt: `${d(1)}T09:30:00Z`
    },
    {
      id: 'SETTLE-002',
      actionType: 'RESOLVE_DISCREPANCY',
      title: 'Allocate $3,800.00 EUR and Close USD Invoice INV-2026-008',
      description: 'Authorize foreign exchange surplus recognition for Solaria Solar Systems and mark invoice INV-2026-008 fully settled.',
      transactionId: 'TXN-2013',
      invoiceId: 'INV-1008',
      amount: 3800.00,
      currency: 'USD',
      aiRationale: 'Confidence: 91%. Total received value exceeds invoice debt by $304 USD. Closing invoice satisfies customer and prevents overdue notices.',
      riskAssessment: 'Zero loss risk. Records a favorable FX realization gain of $304.00.',
      approvalStatus: 'PENDING_APPROVAL',
      createdAt: `${d(2)}T15:00:00Z`
    },
    {
      id: 'SETTLE-003',
      actionType: 'ALLOCATE_PARTIAL',
      title: 'Accept $50 Bank Fee Write-Off for Quantum Cloud Invoice',
      description: 'Apply remaining $50.00 as bank wire transaction cost allowance and change INV-2026-006 status from PARTIALLY_PAID to PAID.',
      transactionId: 'TXN-2011',
      invoiceId: 'INV-1006',
      amount: 50.00,
      currency: 'USD',
      aiRationale: 'Confidence: 89%. Deducted amount matches standard SWIFT/intermediary wire charge. Retaining relationship outweighs collection overhead.',
      riskAssessment: 'Minimal cost ($50.00 write-off). Eliminates administrative tracking overhead.',
      approvalStatus: 'PENDING_APPROVAL',
      createdAt: `${d(2)}T12:00:00Z`
    }
  ];

  // AI Investigations
  const aiInvestigations: AIInvestigation[] = [
    {
      id: 'INV-AI-001',
      transactionId: 'TXN-2010',
      summary: 'Transaction PAYPAL-TXN-9010 ($5,120.00) from Global Transmit Logistics is unmatched because the entity does not exist in the active Customer Directory, though the amount exactly matches overdue invoice INV-2026-007 from Nexus Dynamic Works.',
      issue_type: 'unknown_payer_with_cross_entity_amount_match',
      risk_level: 'MEDIUM',
      confidence: 0.88,
      evidence: [
        'Amount ($5,120.00) matches INV-2026-007 down to the cent',
        'Payer domain @globaltransmit.co.uk is a known UK freight forwarder for Nexus Dynamic Works Germany',
        'No invoice reference was provided in the payment note'
      ],
      recommended_actions: [
        'Confirm whether Global Transmit Logistics settled on behalf of Nexus Dynamic Works',
        'If confirmed, manually link TXN-2010 to INV-2026-007 and mark as reconciled',
        'Update Nexus Dynamic Works profile to add Global Transmit as authorized payer'
      ],
      requires_human_review: true,
      createdAt: `${d(3)}T16:30:00Z`
    }
  ];

  // Audit Logs
  const auditLogs: AuditLog[] = [
    {
      id: 'AUDIT-001',
      action: 'SYSTEM_INITIALIZED',
      category: 'SYSTEM',
      details: 'SettleWise AI Core Engine initialized with PayPal Sandbox integration and deterministic scoring rules.',
      actor: 'system',
      timestamp: `${d(28)}T08:00:00Z`
    },
    {
      id: 'AUDIT-002',
      action: 'RECONCILIATION_RUN_COMPLETED',
      category: 'RECONCILIATION',
      details: 'Automated batch run processed 18 transactions. Reconciled $32,350.00 across 8 exact matches.',
      actor: 'reconciliation_cron',
      targetId: 'RUN-2026-001',
      targetType: 'ReconciliationRun',
      timestamp: `${d(8)}T12:00:00Z`
    },
    {
      id: 'AUDIT-003',
      action: 'ANOMALY_FLAGGED',
      category: 'AI_INVESTIGATION',
      details: 'Critical anomaly ANOM-001 created: Duplicate payment candidate $4,200.00 from BioGenix Labs.',
      actor: 'anomaly_detector',
      targetId: 'ANOM-001',
      targetType: 'AnomalyAlert',
      timestamp: `${d(1)}T09:15:00Z`
    },
    {
      id: 'AUDIT-004',
      action: 'PAYPAL_ORDER_CREATED',
      category: 'PAYPAL',
      details: 'PayPal Sandbox Order ORD-SANDBOX-7821 generated for Invoice INV-2026-011 ($2,200.00 USD).',
      actor: 'tanya.garg@settlewise.internal',
      targetId: 'ORD-SANDBOX-7821',
      targetType: 'PaymentOrder',
      timestamp: `${d(1)}T11:58:00Z`
    },
    {
      id: 'AUDIT-005',
      action: 'PAYPAL_CAPTURE_SUCCESS',
      category: 'PAYPAL',
      details: 'PayPal Sandbox payment captured successfully. Capture ID: CAP-SANDBOX-1982 for $2,200.00 USD.',
      actor: 'paypal_webhook',
      targetId: 'CAP-SANDBOX-1982',
      targetType: 'PaymentCapture',
      timestamp: `${d(1)}T12:00:00Z`
    }
  ];

  return {
    customers,
    invoices,
    transactions,
    reconciliationMatches: [],
    reconciliationRuns: [],
    anomalies,
    aiInvestigations,
    settlementRecommendations,
    auditLogs,
    webhookEvents: [],
    lastUpdated: now.toISOString()
  };
}

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    ensureDataDirectory();
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Failed to parse existing db file, generating seed data:', err);
    }
    const seed = generateSeedData();
    this.saveData(seed);
    return seed;
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      ensureDataDirectory();
      dataToSave.lastUpdated = new Date().toISOString();
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public resetToSeed(): DatabaseSchema {
    const seed = generateSeedData();
    this.data = seed;
    this.saveData(seed);
    this.addAuditLog({
      action: 'DATABASE_RESET',
      category: 'SYSTEM',
      details: 'Database reset to initial demo state with 25 invoices and 35 transactions.',
      actor: 'admin'
    });
    return this.data;
  }

  public getSnapshot(): DatabaseSchema {
    return this.data;
  }

  // Customers
  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  // Invoices
  public getInvoices(): Invoice[] {
    return this.data.invoices;
  }

  public getInvoiceById(id: string): Invoice | undefined {
    return this.data.invoices.find(inv => inv.id === id || inv.invoiceNumber === id);
  }

  public saveInvoice(invoice: Invoice): Invoice {
    const idx = this.data.invoices.findIndex(i => i.id === invoice.id);
    if (idx >= 0) {
      invoice.updatedAt = new Date().toISOString();
      this.data.invoices[idx] = invoice;
    } else {
      invoice.createdAt = new Date().toISOString();
      invoice.updatedAt = invoice.createdAt;
      this.data.invoices.unshift(invoice);
    }
    this.saveData(this.data);
    return invoice;
  }

  // Transactions
  public getTransactions(): Transaction[] {
    return this.data.transactions;
  }

  public getTransactionById(id: string): Transaction | undefined {
    return this.data.transactions.find(t => t.id === id || t.transactionId === id || t.paypalOrderId === id);
  }

  public saveTransaction(txn: Transaction): Transaction {
    const idx = this.data.transactions.findIndex(t => t.id === txn.id || t.transactionId === txn.transactionId);
    if (idx >= 0) {
      txn.updatedAt = new Date().toISOString();
      this.data.transactions[idx] = txn;
    } else {
      txn.createdAt = new Date().toISOString();
      txn.updatedAt = txn.createdAt;
      this.data.transactions.unshift(txn);
    }
    this.saveData(this.data);
    return txn;
  }

  // Reconciliation Runs & Matches
  public getReconciliationRuns(): ReconciliationRun[] {
    return this.data.reconciliationRuns;
  }

  public saveReconciliationRun(run: ReconciliationRun) {
    this.data.reconciliationRuns.unshift(run);
    this.saveData(this.data);
  }

  public getReconciliationMatches(): ReconciliationMatch[] {
    return this.data.reconciliationMatches;
  }

  public saveReconciliationMatches(matches: ReconciliationMatch[]) {
    this.data.reconciliationMatches = [...matches, ...this.data.reconciliationMatches];
    this.saveData(this.data);
  }

  public updateMatchStatus(matchId: string, status: 'APPROVED' | 'REJECTED', reviewedBy: string, notes?: string): ReconciliationMatch | undefined {
    const match = this.data.reconciliationMatches.find(m => m.id === matchId);
    if (!match) return undefined;

    match.status = status;
    match.reviewedBy = reviewedBy;
    match.reviewedAt = new Date().toISOString();
    if (notes) match.userNotes = notes;

    // If approved, update transaction and invoice
    if (status === 'APPROVED') {
      const txn = this.getTransactionById(match.transactionId);
      const inv = this.getInvoiceById(match.invoiceId);
      if (txn && inv) {
        txn.reconciliationStatus = match.matchType === 'PARTIAL' ? 'PARTIAL_MATCH' : 'RECONCILED';
        txn.matchedInvoiceId = inv.id;
        txn.invoiceReference = inv.invoiceNumber;
        this.saveTransaction(txn);

        inv.paidAmount = Math.min(inv.amount, inv.paidAmount + txn.amount);
        inv.remainingAmount = Math.max(0, inv.amount - inv.paidAmount);
        inv.status = inv.remainingAmount === 0 ? 'PAID' : 'PARTIALLY_PAID';
        this.saveInvoice(inv);

        this.addAuditLog({
          action: 'MATCH_APPROVED',
          category: 'RECONCILIATION',
          details: `Reconciliation match approved for Txn ${txn.transactionId} and Invoice ${inv.invoiceNumber}. Score: ${match.score}.`,
          actor: reviewedBy,
          targetId: match.id,
          targetType: 'ReconciliationMatch'
        });
      }
    } else if (status === 'REJECTED') {
      const txn = this.getTransactionById(match.transactionId);
      if (txn) {
        txn.reconciliationStatus = 'REJECTED';
        this.saveTransaction(txn);
        this.addAuditLog({
          action: 'MATCH_REJECTED',
          category: 'RECONCILIATION',
          details: `Reconciliation match rejected for Txn ${txn.transactionId}. Reason: ${notes || 'Manual review rejection'}.`,
          actor: reviewedBy,
          targetId: match.id,
          targetType: 'ReconciliationMatch'
        });
      }
    }

    this.saveData(this.data);
    return match;
  }

  // Anomalies
  public getAnomalies(): AnomalyAlert[] {
    return this.data.anomalies;
  }

  public getAnomalyById(id: string): AnomalyAlert | undefined {
    return this.data.anomalies.find(a => a.id === id);
  }

  public saveAnomaly(anomaly: AnomalyAlert): AnomalyAlert {
    const idx = this.data.anomalies.findIndex(a => a.id === anomaly.id);
    if (idx >= 0) {
      this.data.anomalies[idx] = anomaly;
    } else {
      this.data.anomalies.unshift(anomaly);
    }
    this.saveData(this.data);
    return anomaly;
  }

  // AI Investigations
  public getAIInvestigations(): AIInvestigation[] {
    return this.data.aiInvestigations;
  }

  public saveAIInvestigation(investigation: AIInvestigation): AIInvestigation {
    const idx = this.data.aiInvestigations.findIndex(i => i.id === investigation.id);
    if (idx >= 0) {
      this.data.aiInvestigations[idx] = investigation;
    } else {
      this.data.aiInvestigations.unshift(investigation);
    }
    this.saveData(this.data);
    return investigation;
  }

  // Settlement Recommendations
  public getSettlements(): SettlementRecommendation[] {
    return this.data.settlementRecommendations;
  }

  public getSettlementById(id: string): SettlementRecommendation | undefined {
    return this.data.settlementRecommendations.find(s => s.id === id);
  }

  public saveSettlement(settlement: SettlementRecommendation): SettlementRecommendation {
    const idx = this.data.settlementRecommendations.findIndex(s => s.id === settlement.id);
    if (idx >= 0) {
      this.data.settlementRecommendations[idx] = settlement;
    } else {
      this.data.settlementRecommendations.unshift(settlement);
    }
    this.saveData(this.data);
    return settlement;
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  public addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const log: AuditLog = {
      ...entry,
      id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(log);
    // Keep max 500 logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.saveData(this.data);
    return log;
  }

  // Webhook Events
  public getWebhookEvents(): WebhookEventRecord[] {
    return this.data.webhookEvents;
  }

  public hasWebhookEvent(eventId: string): boolean {
    return this.data.webhookEvents.some(w => w.eventId === eventId);
  }

  public saveWebhookEvent(event: WebhookEventRecord): WebhookEventRecord {
    this.data.webhookEvents.unshift(event);
    this.saveData(this.data);
    return event;
  }
}

export const db = new DatabaseManager();
