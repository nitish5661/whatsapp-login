// server.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const app = express();

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let qrCodeData = null;

client.on('qr', async (qr) => {
    console.log('New QR generated');
    qrCodeData = await qrcode.toDataURL(qr); // Store QR as image data
});

client.on('ready', () => {
    console.log('✅ WhatsApp is ready!');
});

client.initialize();

app.get('/', (req, res) => {
    res.send('<h2>🔗 WhatsApp QR Login</h2><p>Go to /qr to get the QR Code</p>');
});

app.get('/qr', (req, res) => {
    if (!qrCodeData) return res.send('❌ QR not generated yet. Please refresh.');
    res.send(`<img src="${qrCodeData}" alt="Scan this QR" />`);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 App running at http://localhost:${port}`));
