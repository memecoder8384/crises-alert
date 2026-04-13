const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the Gemini client. 
// In production, always use environment variables (process.env.GEMINI_API_KEY)
const ai = new GoogleGenAI({ apiKey: 'AIzaSyDjwtf6H8rWEi5TATXfdcEItMgtjDvsQYM' });

// Create an endpoint for your frontend to talk to
app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Flash is the recommended model for fast, standard text tasks
      contents: userMessage,
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error communicating with Gemini");
  }
});

app.listen(3000, () => console.log('Chatbot server running on port 3000'));
