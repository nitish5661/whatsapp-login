const express = require('express');
const qrcode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] },
});

let qrImage = '';
let isReady = false;

client.on('qr', async (qr) => {
  qrImage = await qrcode.toDataURL(qr);
  isReady = false;
});

client.on('ready', () => {
  console.log('✅ WhatsApp is ready!');
  isReady = true;
});

client.initialize();

const API_KEY = 'fffjhjfjffjjffjfjmy-secret-token'; // change this for security

// Route: show QR code
app.get('/qr', (req, res) => {
  if (!qrImage) return res.send('❌ QR not ready');
  res.send(`<img src="${qrImage}" alt="Scan QR to login" />`);
});

// Route: check if WhatsApp is connected
app.get('/status', (req, res) => {
  res.json({ status: isReady ? 'ready' : 'not_ready' });
});

// Route: send message (secured)
app.post('/send', async (req, res) => {
  const { token, phone, message } = req.body;
  if (token !== 'fffjhjfjffjjffjfjmy-secret-token') {
    return res.status(403).json({ error: 'Invalid token' });
  }

  if (!isReady) {
    return res.status(400).json({ error: 'WhatsApp not ready' });
  }

  try {
    await client.sendMessage(`${phone}@c.us`, message);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
