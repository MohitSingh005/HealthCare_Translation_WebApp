import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 5000;

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY environment variable is required!');
  console.log('📝 Get your free API key from: https://aistudio.google.com/app/apikey');
  console.log('🔧 Set it with: export GEMINI_API_KEY=your_key_here');
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey });

app.use(express.json());
app.use(express.static('public'));

// In-memory storage for sessions
let sessions = [];

// Translation API endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, inputLanguage, outputLanguage, isMedical } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ 
        message: "No text provided for translation" 
      });
    }
    
    const startTime = Date.now();
    
    const prompt = isMedical 
      ? `You are a professional medical translator. Translate the following text accurately while preserving medical terminology and context.
        
        Translate from ${inputLanguage} to ${outputLanguage}: "${text}"
        
        Respond with JSON: { "translatedText": "translation here", "confidence": 0.95 }`
      : `Translate accurately from ${inputLanguage} to ${outputLanguage}: "${text}"
        
        Respond with JSON: { "translatedText": "translation here", "confidence": 0.95 }`;

    console.log(`🔄 Translating: "${text}" from ${inputLanguage} to ${outputLanguage}`);

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      config: { responseMimeType: "application/json" },
      contents: prompt
    });

    const result = JSON.parse(response.text || '{}');
    const processingTime = Date.now() - startTime;

    console.log(`✅ Translation success: "${result.translatedText}" (${processingTime}ms)`);

    res.json({
      translatedText: result.translatedText || text,
      confidence: result.confidence || 0.85,
      processingTime
    });

  } catch (error) {
    console.error("❌ Translation error:", error);
    
    let errorMessage = "Translation failed. Please check your connection and try again.";
    
    if (error.message?.includes('API_KEY')) {
      errorMessage = "Invalid API key. Please check your GEMINI_API_KEY environment variable.";
    } else if (error.message?.includes('quota')) {
      errorMessage = "API quota exceeded. Please check your Gemini API usage limits.";
    }
    
    res.status(500).json({ message: errorMessage });
  }
});

// Save session endpoint
app.post('/api/sessions', (req, res) => {
  try {
    const session = {
      id: Date.now().toString(),
      timestamp: new Date(),
      ...req.body
    };
    sessions.unshift(session);
    sessions = sessions.slice(0, 10); // Keep only last 10 sessions
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: "Failed to save session" });
  }
});

// Get sessions endpoint
app.get('/api/sessions', (req, res) => {
  res.json(sessions.slice(0, 5));
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello"
    });
    res.json({ 
      status: "healthy",
      speechApi: "available",
      translationApi: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Health check failed:", error);
    res.status(503).json({ 
      status: "degraded",
      speechApi: "available",
      translationApi: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🏥 Healthcare Translation App running on http://localhost:${port}`);
  console.log(`🔑 Using API key: ${apiKey ? '✅ Valid' : '❌ Missing'}`);
  console.log(`📝 If translation fails, get API key from: https://aistudio.google.com/app/apikey`);
});