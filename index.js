import http from 'http';
import https from 'https';

const PORT = process.env.PORT || 3000;
const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;

const sendNotification = (token, title, body) => {
  const payload = JSON.stringify({
    to: token,
    notification: {
      title,
      body
    }
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'fcm.googleapis.com',
      path: '/fcm/send',
      method: 'POST',
      headers: {
        'Authorization': `key=${FCM_SERVER_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, res => { // Usar HTTPS aqui
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(data);
        else reject(data);
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/send-notification') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { token, title, message } = JSON.parse(body);
        if (!token || !title || !message) {
          res.writeHead(400);
          res.end('Missing fields');
          return;
        }
        const result = await sendNotification(token, title, message);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, result }));
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: e.toString() }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
