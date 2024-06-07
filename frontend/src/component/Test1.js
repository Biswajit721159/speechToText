import { useEffect, useState, useCallback, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import io from 'socket.io-client';
import './Test1.css';

let socket;
let result = null;

const Tast1 = () => {
    const [language, setLanguage] = useState('en-IN');
    const [sourceLanguage, setsourceLanguage] = useState('English');
    const [targetLanguage, settargetLanguage] = useState('Hindi');
    const [button, setbutton] = useState("Start");
    const [dissableSourceOption, setdissableSourceOption] = useState(false);
    const [dissableTargetOption, setdissableTargetOption] = useState(false);

    const { transcript, interimTranscript, browserSupportsSpeechRecognition, resetTranscript } = useSpeechRecognition({ continuous: true, language: language });

    const [chunks, setChunks] = useState('');
    const [answer, setanswer] = useState('');
    const arr = useRef([]);

    function numberOfWords(str) {
        const words = str.match(/\S+/g);
        return words ? words.length : 0;
    }

    const startListening = () => {
        SpeechRecognition.startListening({ continuous: true, language: language });
        setdissableSourceOption(true);
        setdissableTargetOption(true);
        setbutton("Stop");
    }

    const stopListening = () => {
        SpeechRecognition.stopListening();
        setbutton("Start");
    }

    useEffect(() => {
        if (interimTranscript) {
            setChunks(interimTranscript);
        }
    }, [interimTranscript]);

    async function solveAnswer() {
        if (socket && chunks && result === null && arr.current.length !== 0) {
            result = "pending";
            const chunk = chunks;
            setChunks('');
            const textData = arr.current[0];
            console.log("Sending data to backend:", textData); // Added log
            await socket.emit("sendToBackend", { chunk: textData, sourceLanguage, targetLanguage }, (data) => {
                console.log("Received data from backend:", data); // Added log
                setanswer(data.replace(/'/g, ''));
                result = null;
                arr.current.shift();
                solveAnswer();
            });
        }
    }

    useEffect(() => {
        const interval = setTimeout(() => {
            if (transcript.length !== 0 && numberOfWords(transcript) > 1) {
                arr.current.push(transcript);
            }
            solveAnswer();
        }, 500);
        return () => clearInterval(interval);
    }, [transcript]);

    const initializeSocket = useCallback(() => {
        if (!socket) {
            socket = io('https://speech-to-text-ijrl.vercel.app', {
                transports: ['websocket'],
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });
            socket.on('connect', () => {
                console.log("Connected to backend");
            });
            socket.on('disconnect', () => {
                console.log("Disconnected from backend");
            });
            socket.on('connect_error', (error) => {
                console.error("Connection error:", error);
            });
        }
    }, []);

    useEffect(() => {
        initializeSocket();
        return () => {
            if (socket) {
                socket.disconnect();
                socket = null;
            }
        };
    }, [initializeSocket]);

    if (!browserSupportsSpeechRecognition) {
        return null;
    }

    const sourcelanguageChange = (e) => {
        const value = e.target.value;
        setLanguage(`${value}-IN`);
        setsourceLanguage(value === 'en' ? 'English' : value === 'hi' ? 'Hindi' : 'Bengali');
    }

    const targetlanguageChange = (e) => {
        const value = e.target.value;
        settargetLanguage(value === 'en' ? 'English' : value === 'hi' ? 'Hindi' : 'Bengali');
    }

    const clear = () => {
        stopListening();
        resetTranscript();
        setChunks('');
        setanswer('');
        arr.current = [];
        setdissableSourceOption(false);
        setdissableTargetOption(false);
    }

    return (
        <div className="container">
            <h2>Speech to Text Converter</h2>
            <div className="btn-style">
                <button onClick={button === "Start" ? startListening : stopListening}>{button}</button>
                <button onClick={clear}>Clear</button>
            </div>
            <div className="selectform">
                <div>
                    <label>Source Language</label>
                    <select onChange={sourcelanguageChange} disabled={dissableSourceOption}>
                        <option value='en'>English</option>
                        <option value='hi'>Hindi</option>
                        <option value='bn'>Bengali</option>
                    </select>
                </div>
                <div>
                    <label>Target Language</label>
                    <select onChange={targetlanguageChange} disabled={dissableTargetOption}>
                        <option value='en'>English</option>
                        <option value='hi'>Hindi</option>
                        <option value='bn'>Bengali</option>
                    </select>
                </div>
            </div>
            <div className="main-content">{transcript}</div>
            <div className="main-content">{answer}</div>
        </div>
    );
};

export default Tast1;
