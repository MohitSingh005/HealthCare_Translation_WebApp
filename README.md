
🏥 Healthcare Translation App

A real-time multilingual healthcare translation web app powered by Google Gemini AI.
It enables patients and healthcare providers to communicate seamlessly across languages using speech recognition, AI translation, and text-to-speech playback.

✨ Features

🎤 Voice Input – Record patient speech using browser speech recognition.

🌐 AI Translation – Translate in real-time with Google Gemini AI, preserving medical terminology.

🧾 Dual Transcript – View both original and translated text side by side.

🔊 Speech Output – Play back translated text in the provider’s language.

💾 Session Management – Save and retrieve recent translation sessions.

🛡️ HIPAA-Secure UI Design – Built for medical communication.

📊 Metrics Tracking – Session duration, words translated, and API health indicators.

🛠️ Tech Stack

Frontend:

HTML + TailwindCSS (UI)

JavaScript (Speech Recognition + DOM interactions)

Backend:

Node.js + Express.js (API server)

Google Gemini AI (@google/genai) for translation

Other:

dotenv for API key management

In-memory session storage

📦 Installation

Clone the repo

git clone https://github.com/your-username/healthcare-translation-app.git
cd healthcare-translation-app


Install dependencies

npm install


Set up environment variables
Create a .env file in the root directory:

GEMINI_API_KEY=your_api_key_here
PORT=5000


📝 Get your API key from: Google AI Studio

Run the app

npm start


or in development mode:

npm run dev

🚀 Usage

Open the app in your browser:
👉 http://localhost:5000

Select patient and provider languages.

Click 🎤 Record and start speaking.

View real-time transcripts and translations.

Use 🔊 Speak to hear the translation aloud.

Save sessions for later reference.

📂 Project Structure
├── app.js                # Frontend logic (speech recognition, UI updates)
├── index.html            # Main UI page
├── simple-app-fixed.js   # Express backend + Gemini AI API integration
├── package.json          # Project metadata & dependencies
├── package-lock.json     # Dependency lock file
├── public/               # Static assets (served by Express)
│   └── index.html
└── .env                  # Environment variables (not committed)

🔧 API Endpoints

POST /api/translate → Translate patient speech into provider’s language

POST /api/sessions → Save a translation session

GET /api/sessions → Retrieve recent sessions

GET /api/health → Check API & server health

📝 License

MIT License © 2025 Healthcare Translation Team
