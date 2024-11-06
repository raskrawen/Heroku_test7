// server.js beskeder lægges i et array.
// ekstra prompt er lagt i miljøvariabel.
//specielt til SRP
const express = require('express');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const path = require('path');

// Konfigurer dotenv for udviklingsmiljø
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Hent API-nøglen fra miljøvariabler
//process.env.OPENAI_API_KEY

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const roleDescription = process.env.CHATBOT_ROLE;

// Initialiser en tom array for at gemme beskedhistorikken
let messages = [{ role: 'system', content: roleDescription }];

// API-rute til at sende brugerens besked til OpenAI
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    // Tilføj brugerens besked til messages
    messages.push({ role: 'user', content: userMessage });

    // Tilføj rollen som sidste besked i messages for at sikre konteksten
    messages.push({ role: 'system', content: roleDescription });
    //temp = process.env.CHATBOT_TEMPERATURE;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`, // Brug miljøvariabel til API-nøgle
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        const botMessage = data.choices[0].message.content;

        // Tilføj OpenAI's svar til messages
        messages.push({ role: 'assistant', content: botMessage });

        res.json({ reply: botMessage });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Der opstod en fejl med API-opkaldet.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server kører på http://localhost:${PORT}`);
});
