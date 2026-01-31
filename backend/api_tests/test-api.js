#!/usr/bin/env node
/**
 * API Endpoint Test Runner
 * Run: node api_tests/test-api.js
 * Requires: Server running on BASE_URL (default http://localhost:3000)
 */

require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || process.env.API_BASE_URL || 'http://localhost:3000/api';
const timestamp = Date.now();

// Test state - stores tokens and IDs for dependent tests
const state = {
  vendorToken: null,
  vendorId: null,
  customerToken: null,
  customerId: null,
  adminToken: null,
  productId: null,
  quotationId: null,
  orderId: null,
  invoiceId: null,
  addressId: null,
  pickupId: null,
  returnId: null,
  periodTypeId: 1,
  rentalPeriodId: null,
  taxConfigId: null,
  attributeId: null,
  attributeValueId: null,
};

// Results tracking
let passed = 0;
let failed = 0;
const failures = [];

function log(msg, type = 'info') {
  const icons = { info: '  ', pass: '✓', fail: '✗', skip: '○' };
  const colors = { info: '\x1b[0m', pass: '\x1b[32m', fail: '\x1b[31m', skip: '\x1b[33m' };
  console.log(`${colors[type]}${icons[type]} ${msg}\x1b[0m`);
}

async function test(name, fn) {
  try {
    await fn();
    passed++;
    log(name, 'pass');
    return true;
  } catch (err) {
    failed++;
    const msg = err.response?.data?.error || err.message || String(err);
    failures.push({ name, error: msg });
    log(`${name} - ${msg}`, 'fail');
    return false;
  }
}

async function testExpectStatus(name, fn, expectedStatus = 200) {
  try {
    const res = await fn();
    const status = res?.status ?? res;
    if (status === expectedStatus) {
      passed++;
      log(name, 'pass');
      return res;
    }
    throw new Error(`Expected ${expectedStatus}, got ${status}`);
  } catch (err) {
    if (err.response?.status === expectedStatus) {
      passed++;
      log(name, 'pass');
      return err.response;
    }
    failed++;
    const msg = err.response?.data?.error || err.message || String(err);
    failures.push({ name, error: msg });
    log(`${name} - ${msg}`, 'fail');
    return null;
  }
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  validateStatus: () => true,
  timeout: 10000,
});

// Log all API responses
api.interceptors.response.use((response) => {
  const method = response.config.method?.toUpperCase();
  const url = response.config.url || response.config.baseURL;
  const status = response.status;
  const data = response.data;
  const preview = JSON.stringify(data, null, 2);
  const maxLen = 2000;
  const truncated = preview.length > maxLen ? preview.slice(0, maxLen) + '\n... (truncated)' : preview;
  console.log(`\n  [${method} ${url}] ${status}\n${truncated}\n`);
  return response;
});

// ========== 1. HEALTH & PUBLIC ==========
async function runHealthTests() {
  console.log('\n--- Health & Public ---');
  await test('GET /api/health', async () => {
    const res = await api.get('/health');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.data?.status) throw new Error('Missing status');
  });
}

// ========== 2. AUTH ==========
async function runAuthTests() {
  console.log('\n--- Auth ---');
  const vendorEmail = `vendor_${timestamp}@test.com`;
  const customerEmail = `customer_${timestamp}@test.com`;

  await test('POST /auth/signup (vendor)', async () => {
    const res = await api.post('/auth/signup', {
      name: 'Test Vendor',
      email: vendorEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'vendor',
      companyName: 'Test Diggers Pvt Ltd',
      gstin: '24ABCDE1234F1Z5',
    });
    if (res.status !== 201) throw new Error(res.data?.error || `Status ${res.status}`);
    state.vendorToken = res.data.token;
    state.vendorId = res.data.user?.id;
  });

  await test('POST /auth/signup (customer)', async () => {
    const res = await api.post('/auth/signup', {
      name: 'Test Customer',
      email: customerEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'customer',
    });
    if (res.status !== 201) throw new Error(res.data?.error || `Status ${res.status}`);
    state.customerToken = res.data.token;
    state.customerId = res.data.user?.id;
  });

  await test('POST /auth/login (vendor)', async () => {
    const res = await api.post('/auth/login', { email: vendorEmail, password: 'Password123!' });
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    state.vendorToken = res.data.token;
  });

  await test('POST /auth/login (customer)', async () => {
    const res = await api.post('/auth/login', { email: customerEmail, password: 'Password123!' });
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    state.customerToken = res.data.token;
  });

  await test('POST /auth/login (invalid)', async () => {
    const res = await api.post('/auth/login', { email: 'invalid@test.com', password: 'wrong' });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await test('POST /auth/forgot-password', async () => {
    const res = await api.post('/auth/forgot-password', { email: customerEmail });
    if (res.status !== 200 && res.status !== 404) throw new Error(`Status ${res.status}`);
  });
}

// ========== 3. USERS (Customer token) ==========
async function runUserTests() {
  console.log('\n--- Users ---');
  const auth = { headers: { Authorization: `Bearer ${state.customerToken}` } };

  await test('GET /users/profile', async () => {
    const res = await api.get('/users/profile', auth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });

  await test('PUT /users/profile', async () => {
    const res = await api.put('/users/profile', { name: 'Test Customer Updated' }, auth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });

  await test('POST /users/addresses', async () => {
    const res = await api.post(
      '/users/addresses',
      {
        label: 'Head Office',
        addressType: 'billing',
        line1: '404 Commerce House',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
      },
      auth
    );
    if (res.status !== 201) throw new Error(res.data?.error || `Status ${res.status}`);
    state.addressId = res.data.address?.id;
  });

  await test('GET /users/addresses', async () => {
    const res = await api.get('/users/addresses', auth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });

  if (state.addressId) {
    await test('PUT /users/addresses/:id', async () => {
      const res = await api.put(
        `/users/addresses/${state.addressId}`,
        { label: 'Updated Label' },
        auth
      );
      if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    });
  }
}

// ========== 4. PRODUCTS (Vendor token) ==========
async function runProductTests() {
  console.log('\n--- Products ---');
  const auth = { headers: { Authorization: `Bearer ${state.vendorToken}` } };

  await test('POST /products', async () => {
    const res = await api.post(
      '/products',
      {
        name: 'Heavy Duty Excavator',
        sku: `EXC-200-${timestamp}`,
        costPrice: 5000000,
        salesPrice: 5000,
        isRentable: true,
        qtyOnHand: 5,
        isPublished: true,
        description: '20-ton excavator for heavy earthmoving.',
      },
      auth
    );
    if (res.status !== 201) throw new Error(res.data?.error || `Status ${res.status}`);
    state.productId = res.data.product?.id;
  });

  await test('GET /products', async () => {
    const res = await api.get('/products', auth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });

  if (state.productId) {
    await test('GET /products/:id', async () => {
      const res = await api.get(`/products/${state.productId}`, auth);
      if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    });

    await test('PUT /products/:id', async () => {
      const res = await api.put(
        `/products/${state.productId}`,
        { description: 'Updated description' },
        auth
      );
      if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    });

    await test('GET /products/:id/pricing', async () => {
      const res = await api.get(`/products/${state.productId}/pricing`, auth);
      if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    });

    await test('POST /products/:id/pricing', async () => {
      const res = await api.post(
        `/products/${state.productId}/pricing`,
        { periodTypeId: state.periodTypeId, price: 4500, isActive: true },
        auth
      );
      if (res.status !== 200 && res.status !== 201) throw new Error(res.data?.error || `Status ${res.status}`);
    });

    await test('GET /products/:id/variants', async () => {
      const res = await api.get(`/products/${state.productId}/variants`, auth);
      if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    });

    await test('GET /products/:id/attributes', async () => {
      const res = await api.get(`/products/${state.productId}/attributes`, auth);
      if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    });

    await test('PUT /products/:id/publish', async () => {
      const res = await api.put(
        `/products/${state.productId}/publish`,
        { isPublished: true },
        auth
      );
      if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    });
  }
}

// ========== 5. CATALOG (Public) ==========
async function runCatalogTests() {
  console.log('\n--- Catalog ---');

  await test('GET /catalog/products', async () => {
    const res = await api.get('/catalog/products');
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });

  await test('GET /catalog/products?search=Excavator', async () => {
    const res = await api.get('/catalog/products', { params: { search: 'Excavator' } });
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });

  if (state.productId) {
    await test('GET /catalog/products/:id', async () => {
      const res = await api.get(`/catalog/products/${state.productId}`);
      if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    });

    await test('GET /catalog/products/:id/availability', async () => {
      const res = await api.get(`/catalog/products/${state.productId}/availability`, {
        params: { startDate: '2026-03-01', endDate: '2026-03-05', quantity: 1 },
      });
      if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    });
  }
}

// ========== 6. QUOTATIONS (Customer token) ==========
async function runQuotationTests() {
  console.log('\n--- Quotations ---');
  const auth = { headers: { Authorization: `Bearer ${state.customerToken}` } };

  await test('POST /quotations', async () => {
    const res = await api.post('/quotations', {}, auth);
    if (res.status !== 201 && res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    state.quotationId = res.data.quotation?.id;
  });

  await test('GET /quotations', async () => {
    const res = await api.get('/quotations', auth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });

  if (state.quotationId && state.productId) {
    await test('POST /quotations/:id/lines', async () => {
      const res = await api.post(
        `/quotations/${state.quotationId}/lines`,
        {
          productId: state.productId,
          quantity: 1,
          rentalStart: '2026-03-01',
          rentalEnd: '2026-03-05',
        },
        auth
      );
      if (res.status !== 201) throw new Error(res.data?.error || `Status ${res.status}`);
    });

    await test('GET /quotations/:id', async () => {
      const res = await api.get(`/quotations/${state.quotationId}`, auth);
      if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    });

    if (state.addressId) {
      await test('POST /quotations/:id/confirm', async () => {
        const res = await api.post(
          `/quotations/${state.quotationId}/confirm`,
          { billingAddressId: state.addressId },
          auth
        );
        if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
        state.orderId = res.data.order?.id;
      });
    }
  }
}

// ========== 7. ORDERS ==========
async function runOrderTests() {
  console.log('\n--- Orders ---');
  const customerAuth = { headers: { Authorization: `Bearer ${state.customerToken}` } };
  const vendorAuth = { headers: { Authorization: `Bearer ${state.vendorToken}` } };

  await test('GET /orders (customer)', async () => {
    const res = await api.get('/orders', customerAuth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });

  if (state.orderId) {
    await test('GET /orders/:id (customer)', async () => {
      const res = await api.get(`/orders/${state.orderId}`, customerAuth);
      if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    });

    await test('PUT /orders/:id/status (vendor)', async () => {
      const res = await api.put(
        `/orders/${state.orderId}/status`,
        { status: 'active' },
        vendorAuth
      );
      if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    });
  }
}

// ========== 8. PICKUPS ==========
async function runPickupTests() {
  console.log('\n--- Pickups ---');
  const auth = { headers: { Authorization: `Bearer ${state.vendorToken}` } };

  await test('GET /pickups', async () => {
    const res = await api.get('/pickups', auth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    const pickups = res.data.data || res.data.pickups || res.data || [];
    if (Array.isArray(pickups) && pickups.length > 0) state.pickupId = pickups[0].id;
  });

  if (state.pickupId) {
    await test('GET /pickups/:id', async () => {
      const res = await api.get(`/pickups/${state.pickupId}`, auth);
      if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    });

    await test('PUT /pickups/:id/status', async () => {
      const res = await api.put(
        `/pickups/${state.pickupId}/status`,
        { status: 'dispatched' },
        auth
      );
      if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    });
  }
}

// ========== 9. RETURNS ==========
async function runReturnTests() {
  console.log('\n--- Returns ---');
  const auth = { headers: { Authorization: `Bearer ${state.vendorToken}` } };

  await test('GET /returns', async () => {
    const res = await api.get('/returns', auth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    const returnsList = res.data.data || res.data.returns || res.data || [];
    if (Array.isArray(returnsList) && returnsList.length > 0) state.returnId = returnsList[0].id;
  });

  if (state.returnId) {
    await test('GET /returns/:id', async () => {
      const res = await api.get(`/returns/${state.returnId}`, auth);
      if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    });
  }
}

// ========== 10. INVOICES ==========
async function runInvoiceTests() {
  console.log('\n--- Invoices ---');
  const customerAuth = { headers: { Authorization: `Bearer ${state.customerToken}` } };
  const vendorAuth = { headers: { Authorization: `Bearer ${state.vendorToken}` } };

  await test('GET /invoices (customer)', async () => {
    const res = await api.get('/invoices', customerAuth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });

  if (state.orderId) {
    await test('POST /invoices (vendor)', async () => {
      const res = await api.post(
        '/invoices',
        { rentalOrderId: state.orderId },
        vendorAuth
      );
      if (res.status !== 201) throw new Error(res.data?.error || `Status ${res.status}`);
      state.invoiceId = res.data.invoice?.id;
    });
  }

  if (state.invoiceId) {
    await test('GET /invoices/:id', async () => {
      const res = await api.get(`/invoices/${state.invoiceId}`, vendorAuth);
      if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    });

    await test('PUT /invoices/:id/post (vendor)', async () => {
      const res = await api.put(`/invoices/${state.invoiceId}/post`, {}, vendorAuth);
      if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    });
  }
}

// ========== 11. PAYMENTS ==========
async function runPaymentTests() {
  console.log('\n--- Payments ---');
  const auth = { headers: { Authorization: `Bearer ${state.customerToken}` } };

  await test('GET /payments', async () => {
    const res = await api.get('/payments', auth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });

  if (state.invoiceId) {
    await test('POST /payments (create intent)', async () => {
      const res = await api.post(
        '/payments',
        {
          invoiceId: state.invoiceId,
          amount: 1000,
          paymentType: 'partial',
        },
        auth
      );
      if (res.status !== 200 && res.status !== 201) throw new Error(res.data?.error || `Status ${res.status}`);
    });
  }
}

// ========== 12. DASHBOARD ==========
async function runDashboardTests() {
  console.log('\n--- Dashboard ---');
  const vendorAuth = { headers: { Authorization: `Bearer ${state.vendorToken}` } };
  const customerAuth = { headers: { Authorization: `Bearer ${state.customerToken}` } };

  await test('GET /dashboard/vendor', async () => {
    const res = await api.get('/dashboard/vendor', vendorAuth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });

  await test('GET /dashboard/customer', async () => {
    const res = await api.get('/dashboard/customer', customerAuth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });
}

// ========== 13. REPORTS ==========
async function runReportTests() {
  console.log('\n--- Reports ---');
  const auth = { headers: { Authorization: `Bearer ${state.vendorToken}` } };

  await test('GET /reports/vendor-revenue', async () => {
    const res = await api.get('/reports/vendor-revenue', auth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });

  await test('GET /reports/most-rented', async () => {
    const res = await api.get('/reports/most-rented', auth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });

  await test('GET /reports/order-trends', async () => {
    const res = await api.get('/reports/order-trends', {
      ...auth,
      params: { startDate: '2026-01-01', endDate: '2026-12-31' },
    });
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });

  await test('GET /reports/revenue', async () => {
    const res = await api.get('/reports/revenue', {
      ...auth,
      params: { startDate: '2026-01-01', endDate: '2026-12-31' },
    });
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });

  await test('GET /reports/export', async () => {
    const res = await api.get('/reports/export', {
      ...auth,
      params: { type: 'vendor-revenue', startDate: '2026-01-01', endDate: '2026-12-31' },
    });
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });
}

// ========== 14. NOTIFICATIONS ==========
async function runNotificationTests() {
  console.log('\n--- Notifications ---');
  const auth = { headers: { Authorization: `Bearer ${state.customerToken}` } };

  await test('GET /notifications', async () => {
    const res = await api.get('/notifications', auth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });
}

// ========== 15. ADMIN (optional - requires admin user) ==========
async function runAdminTests() {
  console.log('\n--- Admin ---');
  const adminRes = await api.post('/auth/login', {
    email: process.env.ADMIN_EMAIL || 'admin@rental.com',
    password: process.env.ADMIN_PASSWORD || 'admin',
  });

  if (adminRes.status !== 200) {
    log('Admin login skipped (no admin user)', 'skip');
    return;
  }

  state.adminToken = adminRes.data.token;
  const auth = { headers: { Authorization: `Bearer ${state.adminToken}` } };

  await test('GET /admin/rental-periods', async () => {
    const res = await api.get('/admin/rental-periods', auth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
    const periods = res.data.rentalPeriods || res.data || [];
    if (Array.isArray(periods) && periods.length > 0) state.periodTypeId = periods[0].id;
  });

  await test('GET /admin/tax-configurations', async () => {
    const res = await api.get('/admin/tax-configurations', auth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });

  await test('GET /admin/product-attributes', async () => {
    const res = await api.get('/admin/product-attributes', auth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });

  await test('GET /admin/attribute-values', async () => {
    const res = await api.get('/admin/attribute-values', auth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });

  await test('GET /admin/users', async () => {
    const res = await api.get('/admin/users', auth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });

  await test('GET /admin/late-fee-policies', async () => {
    const res = await api.get('/admin/late-fee-policies', auth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });

  await test('GET /dashboard/admin', async () => {
    const res = await api.get('/dashboard/admin', auth);
    if (res.status !== 200) throw new Error(res.data?.error || `Status ${res.status}`);
  });
}

// ========== 16. AUTH GUARD ==========
async function runAuthGuardTests() {
  console.log('\n--- Auth Guards ---');
  await test('GET /users/profile (no token) → 401', async () => {
    const res = await api.get('/users/profile');
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await test('GET /products (no token) → 401', async () => {
    const res = await api.get('/products');
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await test('GET /api/nonexistent → 404', async () => {
    const res = await api.get('/nonexistent-route-xyz');
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });
}

// ========== CLEANUP (optional - delete address) ==========
async function runCleanup() {
  if (state.addressId && state.customerToken) {
    await api.delete(`/users/addresses/${state.addressId}`, {
      headers: { Authorization: `Bearer ${state.customerToken}` },
    }).catch(() => {});
  }
}

// ========== MAIN ==========
async function main() {
  console.log('\n========================================');
  console.log('  API Endpoint Test Runner');
  console.log('  Base URL:', BASE_URL);
  console.log('========================================\n');

  // Check server is reachable
  try {
    await api.get('/health');
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
      console.error('Error: Cannot connect to server. Make sure the server is running:');
      console.error('  npm run dev');
      console.error('');
      process.exit(1);
    }
    throw err;
  }

  try {
    await runHealthTests();
    await runAuthTests();
    await runUserTests();
    await runProductTests();
    await runCatalogTests();
    await runQuotationTests();
    await runOrderTests();
    await runPickupTests();
    await runReturnTests();
    await runInvoiceTests();
    await runPaymentTests();
    await runDashboardTests();
    await runReportTests();
    await runNotificationTests();
    await runAdminTests();
    await runAuthGuardTests();
  } catch (err) {
    console.error('Fatal error:', err.message);
  }

  console.log('\n========================================');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  if (failures.length > 0) {
    console.log('Failed tests:');
    failures.forEach((f) => console.log(`  - ${f.name}: ${f.error}`));
  }

  process.exit(failed > 0 ? 1 : 0);
}

main();
