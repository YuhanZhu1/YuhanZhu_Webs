const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages
    });

    res.json({ reply: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FaithTalk backend running on port ${PORT}`);
});
