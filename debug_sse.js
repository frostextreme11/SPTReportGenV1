
const https = require('https');

const options = {
    hostname: 'mcp.mayar.id',
    port: 443,
    path: '/sse',
    method: 'GET',
    headers: {
        'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmOWM0Njc0MC1jOTc0LTRjMDUtOWM4MC03NDQ3YzZlM2IwNWIiLCJhY2NvdW50SWQiOiJkNjk5OWJmMi02ZDczLTQxYmUtYTNlYS0wMGU0NzdjNjM3NjEiLCJjcmVhdGVkQXQiOiIxNzY4ODgyMDUzMDM1Iiwicm9sZSI6ImRldmVsb3BlciIsInN1YiI6Im5vdmFuYWRpdHlhMTFAZ21haWwuY29tIiwibmFtZSI6IkZyb3N0Q29yZSIsImxpbmsiOiJkaWdpdGFsc3F1YWQiLCJpc1NlbGZEb21haW4iOm51bGwsImlhdCI6MTc2ODg4MjA1M30.LhZxlKT7Kd5RaQKl8IWYXDlaRPf0-GV8dweeis0jI1xmvjSwcpIEWdMbMIx5GyVBTBkis7fOt7VElhv4SYX-mJzmCWV4bTPnJ8k79c-1yNFnpIin8sN_qcSx1OEFFekloZ7fPNuZRqYaxCaPbYyqlCrKYekfmm7XRnVPq_p8YZDAJsvKHgd4QpP8U4XF8CRWdYGtpp6lOUJ0ijfWtc4rBTF-h8jfJScNfiYCm1MQZH7AMs5vLC-kzo-wKVlZ78SduMKP79TKsF35hsDWp75Z54RtPdOPSwrVVW17itCQTQZbw5md5hBee3KcNRI6kkWfFFG6XuKK3p3ZU-llJA74jA',
        'Accept': 'text/event-stream'
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
        // End after first chunk to avoid hanging
        req.destroy();
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
