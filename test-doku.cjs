
const https = require('https');
const crypto = require('crypto');

const CLIENT_ID = 'BRN-0224-1759408646518';
const SECRET_KEY = 'SK-QHqUQtCsHFUBGtm8KSkl';
const URL = 'https://api-sandbox.doku.com/checkout/v1/payment';

// 1. Generate Data
const invoiceNumber = `TEST${Date.now()}`;
const requestId = crypto.randomUUID();
const timestamp = new Date().toISOString().split('.')[0] + 'Z'; // No millis

const body = JSON.stringify({
    order: {
        amount: 100000,
        invoice_number: invoiceNumber,
        currency: 'IDR',
        callback_url: 'https://example.com',
        language: 'ID'
    },
    customer: {
        id: 'cust-001',
        name: 'Test Debugger',
        email: 'test@example.com'
    }
});

// 2. Digest
const digest = crypto.createHash('sha256').update(body).digest('base64');

// 3. Signature
const target = '/checkout/v1/payment';
const componentSignature = `Client-Id:${CLIENT_ID}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${target}\nDigest:${digest}`;
const signature = crypto.createHmac('sha256', SECRET_KEY).update(componentSignature).digest('base64');
const hmac = 'HMACSHA256=' + signature;

console.log('--- Request Details ---');
console.log('URL:', URL);
console.log('Client-Id:', CLIENT_ID);
console.log('Request-Id:', requestId);
console.log('Sign:', hmac);
console.log('Body:', body);
console.log('-----------------------\n');

// 4. Send Request
const options = {
    method: 'POST',
    headers: {
        'Client-Id': CLIENT_ID,
        'Request-Id': requestId,
        'Request-Timestamp': timestamp,
        'Signature': hmac,
        'Content-Type': 'application/json'
    }
};

const req = https.request(URL, options, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));

    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('\n--- Response Body ---');
        console.log(data);
        console.log('---------------------');
    });
});

req.on('error', (e) => {
    console.error('Request Error:', e);
});

req.write(body);
req.end();
