const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const completion = await openai.createChatCompletion({
      model: "gpt-4o",
      messages
    });

    res.json({ reply: completion.data.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FaithTalk backend running on port ${PORT}`);
});

