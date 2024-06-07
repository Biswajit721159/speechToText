import React, { useState, useEffect } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function SpeechToText() {
    const [sourceLanguage, setSourceLanguage] = useState('en-US');
    const [targetLanguage, setTargetLanguage] = useState('fr-FR');
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const recognitionRef = React.useRef(null);

    useEffect(() => {
        if (!SpeechRecognition) {
            alert("Your browser does not support speech recognition.");
            return;
        }

        if (isListening) {
            if (!recognitionRef.current) {
                const recognitionInstance = new SpeechRecognition();
                recognitionInstance.lang = sourceLanguage;
                recognitionInstance.interimResults = false;
                recognitionInstance.maxAlternatives = 1;

                recognitionInstance.onresult = (event) => {
                    const speechToText = event.results[0][0].transcript;
                    console.log("Speech recognized:", speechToText);
                    setTranscript(speechToText);
                    translateText(speechToText, targetLanguage);
                };

                recognitionInstance.onerror = (event) => {
                    console.error("Speech recognition error:", event.error);
                };

                recognitionInstance.onend = () => {
                    console.log("Speech recognition ended");
                    if (isListening) {
                        recognitionInstance.start();
                    } else {
                        setIsListening(false);
                    }
                };

                recognitionRef.current = recognitionInstance;
            }

            recognitionRef.current.start();
            console.log("Speech recognition started");
        } else if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
            console.log("Speech recognition stopped");
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [isListening, sourceLanguage, targetLanguage]);

    const startListening = () => {
        setIsListening(true);
    };

    const stopListening = () => {
        setIsListening(false);
    };

    const translateText = (text, language) => {
        const translations = {
            'hello': {
                'en-US': 'hello',
                'fr-FR': 'bonjour',
                'hi-IN': 'नमस्ते',
                'bn-IN': 'হ্যালো'
            },
            'goodbye': {
                'en-US': 'goodbye',
                'fr-FR': 'au revoir',
                'hi-IN': 'अलविदा',
                'bn-IN': 'বিদায়'
            },
            'how are you': {
                'en-US': 'how are you',
                'fr-FR': 'comment ça va',
                'hi-IN': 'आप कैसे हैं',
                'bn-IN': 'তুমি কেমন আছো'
            }
        };
        setTranslatedText(translations[text.toLowerCase()] ? translations[text.toLowerCase()][language] : text);
    };

    return (
        <div>
            <div>
                <h2>Speech Recognition</h2>
                <p>{transcript}</p>
            </div>
            <div>
                <h2>Translated Text</h2>
                <p>{translatedText}</p>
            </div>
            {isListening ? (
                <button onClick={stopListening}>Stop Listening</button>
            ) : (
                <button onClick={startListening}>Start Listening</button>
            )}
            <div>
                <label>Source Language:</label>
                <select value={sourceLanguage} onChange={e => setSourceLanguage(e.target.value)}>
                    <option value="en-US">English</option>
                    <option value="hi-IN">Hindi</option>
                    <option value="bn-IN">Bengali</option>
                </select>
            </div>
            <div>
                <label>Target Language:</label>
                <select value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)}>
                    <option value="fr-FR">French</option>
                    <option value="hi-IN">Hindi</option>                    <option value="bn-IN">Bengali</option>
                </select>
            </div>
        </div>
    );
}

export default SpeechToText;
