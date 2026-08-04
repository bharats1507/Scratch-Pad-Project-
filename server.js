require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const API_KEY = process.env.GROQ_API_KEY;
const MODEL = 'llama-3.3-70b-versatile';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body || {};

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'Server is missing its API key. Set GROQ_API_KEY in your environment.' });
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Upstream API error:', response.status, errBody);
      return res.status(502).json({ error: 'The AI service failed to respond. Please try again.' });
    }

    const data = await response.json();
    const text = (data.choices?.[0]?.message?.content || '').trim();

    if (!text) {
      return res.status(502).json({ error: 'The AI service returned an empty response.' });
    }

    res.json({ text });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Unexpected server error while generating a response.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
