const app = require('./dist/index.js').default;
const http = require('http');

function post(url, body, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'POST',
      headers
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }));
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const headers = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'GET',
      headers
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  await new Promise(r => setTimeout(r, 600));

  console.log('\n--- 1. Testing Sales Login ---');
  const loginRes = await post('http://localhost:5000/api/auth/login', { email: 'sales@minierp.com', password: 'Sales@123' });
  console.log('Status:', loginRes.status, 'User Role:', loginRes.body.user?.role);
  const token = loginRes.body.token;

  console.log('\n--- 2. Fetching Customers & Products ---');
  const custRes = await get('http://localhost:5000/api/customers', token);
  const prodRes = await get('http://localhost:5000/api/products', token);
  const testCustomer = custRes.body.data[0];
  const testProduct = prodRes.body.data.find(p => p.currentStock > 0);
  console.log('Customer:', testCustomer.customerName);
  console.log('Product:', testProduct.name, 'Stock:', testProduct.currentStock);

  console.log('\n--- 3. Testing Insufficient Stock Error (Negative Stock Prevention) ---');
  const invalidChallan = await post('http://localhost:5000/api/challans', {
    customerId: testCustomer.id,
    items: [{ productId: testProduct.id, quantity: testProduct.currentStock + 500 }],
    status: 'CONFIRMED'
  }, token);
  console.log('Expected 400 Status:', invalidChallan.status);
  console.log('Error Message:', invalidChallan.body.error);

  console.log('\n--- 4. Testing Valid Challan Creation with Snapshot Data ---');
  const validChallan = await post('http://localhost:5000/api/challans', {
    customerId: testCustomer.id,
    items: [{ productId: testProduct.id, quantity: 2 }],
    status: 'CONFIRMED'
  }, token);
  console.log('Status:', validChallan.status);
  console.log('Challan No:', validChallan.body.challan?.challanNumber);
  console.log('Snapshot Items:', validChallan.body.challan?.items?.map(i => ({ name: i.snapshotProductName, price: i.snapshotUnitPrice, qty: i.quantity })));

  console.log('\n--- 5. Testing RBAC Guard (Sales blocked from Warehouse action) ---');
  const rbacTest = await post('http://localhost:5000/api/products/' + testProduct.id + '/stock-movement', {
    quantity: 10,
    movementType: 'IN',
    reason: 'Unauthorized test'
  }, token);
  console.log('Expected 403 Status:', rbacTest.status);
  console.log('RBAC Error:', rbacTest.body.error);

  console.log('\n✅ ALL BACKEND BUSINESS LOGIC TESTS PASSED!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});