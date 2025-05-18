// server.js — Finalized FaithTalk backend server
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require('openai');

const app = express();

// ✅ CORS policy — allow ONLY your GitHub Pages domain
app.use(cors({
  origin: 'https://yuhanzhu.com', // Adjust if using a different domain or subdomain
  methods: ['GET', 'POST'],
}));

// ✅ Parse JSON body
app.use(express.json());

// ✅ OpenAI client setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Handle /chat → forward to GPT-4o
app.post('/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing or invalid 'messages' array." });
  }

  console.log("🟢 /chat received:", JSON.stringify(messages, null, 2));

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // latest multimodal model
      messages,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    console.log("✅ GPT-4o replied:", reply);

    res.json({ choices: [{ message: { content: reply } }] });
  } catch (error) {
    console.error("❌ OpenAI error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Something went wrong calling GPT." });
  }
});

// ✅ Optional health check
app.get('/ping', (req, res) => {
  console.log("🟡 Ping hit");
  res.send("pong ✅");
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 FaithTalk backend live at http://localhost:${PORT}`);
});


