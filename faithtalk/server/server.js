const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Just echo back the request to test Render + frontend + fetch
app.post('/chat', (req, res) => {
  console.log("🟢 Received request to /chat:", req.body);

  res.json({
    reply: "✅ Your message was received by the server (no GPT call made).",
    received: req.body
  });
});

// 🧪 Add simple GET route for browser testing
app.get('/ping', (req, res) => {
  console.log("🟡 Ping route hit");
  res.send("pong ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 FaithTalk TEST backend running on port ${PORT}`);
});