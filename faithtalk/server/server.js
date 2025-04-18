const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ Allow requests from your custom domain
app.use(cors({
  origin: 'https://yuhanzhu.com',
  methods: ['GET', 'POST'],
}));

app.use(express.json());

// ✅ Echo the request to confirm frontend connection
app.post('/chat', (req, res) => {
  console.log("🟢 Received request to /chat:", req.body);

  res.json({
    reply: "✅ Your message was received by the server (no GPT call made).",
    received: req.body
  });
});

// 🧪 Simple test route
app.get('/ping', (req, res) => {
  console.log("🟡 Ping route hit");
  res.send("pong ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 FaithTalk backend running on port ${PORT}`);
});
