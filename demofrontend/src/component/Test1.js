import { useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const Tast1 = () => {

    const [langauge, setlangauge] = useState('en-IN')
    const startListening = () => SpeechRecognition.startListening({ continuous: true, language: langauge });
    const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    if (!browserSupportsSpeechRecognition) {
        return null
    }

    function langaugeChange(e) {
        let s = `${e.target.value}-IN`
        setlangauge(s)
    }

    return (
        <>
            <div className="container">
                <h2>Speech to Text Converter</h2>
                <select onChange={(e) => { langaugeChange(e) }}>
                    <option value='en'>English</option>
                    <option value='hi'>Hindi</option>
                    <option value='bn'>Bengali</option>
                </select>
                <div className="main-content" >
                    {transcript}
                </div>
                <div className="btn-style">
                    <button onClick={startListening}>Start</button>
                    <button onClick={SpeechRecognition.stopListening}>Stop</button>
                </div>

            </div>

        </>
    );
};

export default Tast1;