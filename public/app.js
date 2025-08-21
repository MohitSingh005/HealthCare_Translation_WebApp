// Healthcare Translation App - Simple Version
class HealthcareTranslator {
    constructor() {
        this.isRecording = false;
        this.recognition = null;
        this.originalText = '';
        this.translatedText = '';
        this.sessionStart = Date.now();
        this.wordsTranslated = 0;
        this.recordingStart = null;
        
        this.languages = {
            'en-US': 'English (US)', 'es-ES': 'Spanish', 'fr-FR': 'French',
            'de-DE': 'German', 'it-IT': 'Italian', 'pt-PT': 'Portuguese',
            'zh-CN': 'Chinese (Mandarin)', 'ja-JP': 'Japanese', 'ar-SA': 'Arabic',
            'ru-RU': 'Russian', 'hi-IN': 'Hindi', 'sa': 'Sanskrit'
        };
        
        this.initElements();
        this.initSpeechRecognition();
        this.initEventListeners();
        this.startSessionTimer();
        this.checkAPIHealth();
    }
    
    initElements() {
        this.elements = {
            inputLanguage: document.getElementById('inputLanguage'),
            outputLanguage: document.getElementById('outputLanguage'),
            recordButton: document.getElementById('recordButton'),
            recordingStatus: document.getElementById('recordingStatus'),
            recordingIndicator: document.getElementById('recordingIndicator'),
            recordingInstructions: document.getElementById('recordingInstructions'),
            originalTranscript: document.getElementById('originalTranscript'),
            translatedTranscript: document.getElementById('translatedTranscript'),
            patientLanguage: document.getElementById('patientLanguage'),
            providerLanguage: document.getElementById('providerLanguage'),
            clearOriginal: document.getElementById('clearOriginal'),
            clearTranslated: document.getElementById('clearTranslated'),
            speakButton: document.getElementById('speakButton'),
            saveButton: document.getElementById('saveButton'),
            newButton: document.getElementById('newButton'),
            sessionDuration: document.getElementById('sessionDuration'),
            wordsTranslated: document.getElementById('wordsTranslated'),
            recordingDuration: document.getElementById('recordingDuration'),
            translationApiStatus: document.getElementById('translationApiStatus')
        };
    }
    
    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = this.elements.inputLanguage.value;
            
            this.recognition.onstart = () => {
                this.isRecording = true;
                this.recordingStart = Date.now();
                this.updateRecordingUI();
            };
            
            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    }
                }
                
                if (finalTranscript) {
                    this.originalText += finalTranscript;
                    this.updateOriginalTranscript();
                    this.translateText(finalTranscript.trim());
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isRecording = false;
                this.updateRecordingUI();
                this.showToast('Speech Recognition Error', 'Unable to access microphone. Please check permissions.');
            };
            
            this.recognition.onend = () => {
                this.isRecording = false;
                this.recordingStart = null;
                this.updateRecordingUI();
            };
        } else {
            this.showToast('Speech Recognition Unavailable', 'Your browser doesn\'t support speech recognition. Please use Chrome or Edge.');
        }
    }
    
    initEventListeners() {
        // Language selection
        this.elements.inputLanguage.addEventListener('change', () => {
            if (this.recognition) {
                this.recognition.lang = this.elements.inputLanguage.value;
            }
            this.updateLanguageLabels();
        });
        
        this.elements.outputLanguage.addEventListener('change', () => {
            this.updateLanguageLabels();
        });
        
        // Recording control
        this.elements.recordButton.addEventListener('click', () => {
            this.toggleRecording();
        });
        
        // Clear buttons
        this.elements.clearOriginal.addEventListener('click', () => {
            this.originalText = '';
            this.updateOriginalTranscript();
        });
        
        this.elements.clearTranslated.addEventListener('click', () => {
            this.translatedText = '';
            this.updateTranslatedTranscript();
        });
        
        // Speak button
        this.elements.speakButton.addEventListener('click', () => {
            this.speakTranslation();
        });
        
        // Session controls
        this.elements.saveButton.addEventListener('click', () => {
            this.saveSession();
        });
        
        this.elements.newButton.addEventListener('click', () => {
            this.newSession();
        });
        
        this.updateLanguageLabels();
    }
    
    updateLanguageLabels() {
        const inputLang = this.languages[this.elements.inputLanguage.value];
        const outputLang = this.languages[this.elements.outputLanguage.value];
        
        this.elements.patientLanguage.textContent = `Patient (${inputLang})`;
        this.elements.providerLanguage.textContent = `Provider (${outputLang})`;
    }
    
    toggleRecording() {
        if (!this.recognition) return;
        
        if (this.isRecording) {
            this.recognition.stop();
        } else {
            this.recognition.lang = this.elements.inputLanguage.value;
            this.recognition.start();
        }
    }
    
    updateRecordingUI() {
        if (this.isRecording) {
            this.elements.recordingStatus.textContent = 'Recording...';
            this.elements.recordingIndicator.className = 'w-3 h-3 rounded-full pulse-red';
            this.elements.recordingInstructions.textContent = 'Tap to stop recording';
            this.elements.recordButton.className = 'inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors';
            this.elements.recordButton.innerHTML = `
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v4a4 4 0 008 0V6a4 4 0 00-4-4zM6 6a4 4 0 118 0v4a4 4 0 01-8 0V6z" clip-rule="evenodd"></path>
                    <path d="M6 10a4 4 0 108 0H6z"></path>
                </svg>
            `;
        } else {
            this.elements.recordingStatus.textContent = 'Ready';
            this.elements.recordingIndicator.className = 'w-3 h-3 rounded-full bg-gray-300';
            this.elements.recordingInstructions.textContent = 'Tap to start recording patient speech';
            this.elements.recordButton.className = 'inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors';
            this.elements.recordButton.innerHTML = `
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd"></path>
                </svg>
            `;
        }
    }
    
    updateOriginalTranscript() {
        if (this.originalText.trim()) {
            this.elements.originalTranscript.innerHTML = `<p class="text-gray-900 leading-relaxed">${this.originalText}</p>`;
        } else {
            this.elements.originalTranscript.innerHTML = '<p class="text-gray-400 text-center py-8">Original speech will appear here...</p>';
        }
    }
    
    updateTranslatedTranscript() {
        if (this.translatedText.trim()) {
            this.elements.translatedTranscript.innerHTML = `<p class="text-gray-900 leading-relaxed">${this.translatedText}</p>`;
        } else {
            this.elements.translatedTranscript.innerHTML = '<p class="text-gray-400 text-center py-8">Translation will appear here...</p>';
        }
    }
    
    async translateText(text) {
        try {
            this.elements.translatedTranscript.innerHTML = `
                <div class="flex items-center space-x-2 text-blue-600">
                    <svg class="w-4 h-4 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Translating...</span>
                </div>
            `;
            
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    inputLanguage: this.elements.inputLanguage.value,
                    outputLanguage: this.elements.outputLanguage.value,
                    isMedical: true
                })
            });
            
            if (!response.ok) throw new Error('Translation failed');
            
            const data = await response.json();
            this.translatedText += ' ' + data.translatedText;
            this.wordsTranslated += data.translatedText.split(' ').length;
            this.updateTranslatedTranscript();
            this.updateWordsCount();
            
        } catch (error) {
            console.error('Translation error:', error);
            this.showToast('Translation Error', 'Unable to translate text. Please check your connection.');
            this.updateTranslatedTranscript();
        }
    }
    
    speakTranslation() {
        if (!this.translatedText.trim()) {
            this.showToast('No Text to Speak', 'Please translate some text first.');
            return;
        }
        
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(this.translatedText);
            utterance.lang = this.elements.outputLanguage.value;
            utterance.rate = 0.9;
            utterance.pitch = 1;
            
            utterance.onstart = () => {
                this.elements.speakButton.innerHTML = `
                    <svg class="w-4 h-4 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Speaking...</span>
                `;
            };
            
            utterance.onend = () => {
                this.elements.speakButton.innerHTML = `
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.76l-4.146-3.317H2a1 1 0 01-1-1V7.5a1 1 0 011-1h2.237l4.146-3.317a1 1 0 011.617.76zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 11-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Speak</span>
                `;
            };
            
            window.speechSynthesis.speak(utterance);
        } else {
            this.showToast('Text-to-Speech Unavailable', 'Your browser doesn\'t support text-to-speech.');
        }
    }
    
    async saveSession() {
        if (!this.originalText.trim() || !this.translatedText.trim()) {
            this.showToast('Nothing to Save', 'Please record and translate some text first.');
            return;
        }
        
        try {
            const response = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalText: this.originalText,
                    translatedText: this.translatedText,
                    inputLanguage: this.elements.inputLanguage.value,
                    outputLanguage: this.elements.outputLanguage.value,
                    metadata: {
                        sessionDuration: Math.floor((Date.now() - this.sessionStart) / 1000),
                        wordsTranslated: this.wordsTranslated,
                        timestamp: new Date().toISOString()
                    }
                })
            });
            
            if (!response.ok) throw new Error('Save failed');
            
            this.showToast('Session Saved', 'Translation session has been saved securely.');
        } catch (error) {
            console.error('Save error:', error);
            this.showToast('Save Failed', 'Unable to save session. Please try again.');
        }
    }
    
    newSession() {
        this.originalText = '';
        this.translatedText = '';
        this.wordsTranslated = 0;
        this.sessionStart = Date.now();
        
        this.updateOriginalTranscript();
        this.updateTranslatedTranscript();
        this.updateWordsCount();
        
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
        }
        
        this.showToast('New Session Started', 'Previous session data has been cleared.');
    }
    
    startSessionTimer() {
        setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.sessionStart) / 1000);
            this.elements.sessionDuration.textContent = this.formatTime(elapsed);
            
            if (this.isRecording && this.recordingStart) {
                const recordingElapsed = Math.floor((Date.now() - this.recordingStart) / 1000);
                this.elements.recordingDuration.textContent = this.formatTime(recordingElapsed);
            } else {
                this.elements.recordingDuration.textContent = '0:00';
            }
        }, 1000);
    }
    
    updateWordsCount() {
        this.elements.wordsTranslated.textContent = this.wordsTranslated;
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    async checkAPIHealth() {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            
            if (data.translationApi === 'connected') {
                this.elements.translationApiStatus.className = 'w-2 h-2 bg-green-500 rounded-full';
            } else {
                this.elements.translationApiStatus.className = 'w-2 h-2 bg-red-500 rounded-full';
            }
        } catch (error) {
            this.elements.translationApiStatus.className = 'w-2 h-2 bg-red-500 rounded-full';
        }
        
        // Check again every 30 seconds
        setTimeout(() => this.checkAPIHealth(), 30000);
    }
    
    showToast(title, message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50';
        toast.innerHTML = `
            <div class="font-semibold text-gray-900">${title}</div>
            <div class="text-gray-600 text-sm mt-1">${message}</div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new HealthcareTranslator();
});