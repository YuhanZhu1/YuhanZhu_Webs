const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid request. 'messages' array is required." });
  }

  // ✅ Debug log input
  console.log("🟢 Received messages:", messages);

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
    });

    const reply = chatCompletion.choices[0].message.content;
    console.log("✅ GPT response:", reply);

    res.json({ reply });
  } catch (error) {
    console.error("❌ OpenAI Error:", error?.response?.data || error.message || error);

    res.status(500).json({
      error: "Something went wrong on the server. Please try again later.",
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ FaithTalk backend running on port ${PORT}`);
});

