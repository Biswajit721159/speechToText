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

    let { finalTranscript, transcript, interimTranscript, browserSupportsSpeechRecognition, resetTranscript }
        = useSpeechRecognition({ continuous: true, language: language });

    const [chunks, setChunks] = useState('');
    let [answer, setanswer] = useState('');
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
    };

    const stopListening = () => {
        SpeechRecognition.stopListening();
        setbutton("Start");
    };

    useEffect(() => {
        if (interimTranscript) {
            setChunks(interimTranscript);
        }
    }, [interimTranscript]);

    async function solveAnswer() {
        if (socket && chunks && result === null && arr.current?.length !== 0) {
            result = "pending";
            let chunk = chunks;
            setChunks('');
            let textData = arr.current?.[0];
            await socket.emit("sendToBackend", { chunk: textData, sourceLanguage: sourceLanguage, targetLanguage: targetLanguage }, (data) => {
                let s = data;
                let outputString = s.replace(/'/g, '');
                setanswer(outputString);
                result = null;
                arr.current.shift();
                solveAnswer();
            });
        }
    }

    useEffect(() => {
        let interval = setTimeout(() => {
            if (transcript?.length !== 0 && numberOfWords(transcript) > 1) {
                arr.current.push(transcript);
            }
            solveAnswer();
        }, 500);
        return () => {
            clearInterval(interval);
        };
    }, [transcript]);

    const initializeSocket = useCallback(() => {
        if (!socket) {
            socket = io('http://localhost:2000', {
                transports: ['websocket', 'polling'],
                // path: '/api/socket.io'  
            });
            socket.on('connect', () => {
                console.log("Connected to backend");
            });
            socket.on('disconnect', () => {
                console.log("Disconnected from backend");
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
        let value = e.target.value;
        let s = `${value}-IN`;
        setLanguage(s);
        if (value === "en") {
            setsourceLanguage('English');
        } else if (value === "hi") {
            setsourceLanguage('Hindi');
        } else if (value === "bn") {
            setsourceLanguage('Bengali');
        } else if (value === "te") {
            setsourceLanguage('Telegu');
        }
    };

    const targetlanguageChange = (e) => {
        let value = e.target.value;
        if (value === "en") {
            settargetLanguage('English');
        } else if (value === "hi") {
            settargetLanguage('Hindi');
        } else if (value === "bn") {
            settargetLanguage('Bengali');
        } else if (value === "te") {
            settargetLanguage('Telegu');
        }
    };

    const clear = () => {
        stopListening();
        resetTranscript();
        setChunks('');
        setanswer('');
        arr.current = [];
        setdissableSourceOption(false);
        setdissableTargetOption(false);
    };

    return (
        <div className="container">
            <h2>Speech to Text Converter</h2>
            <div className="btn-style">
                {button === "Start" ? (
                    <button onClick={startListening}>{button}</button>
                ) : (
                    <button onClick={stopListening}>{button}</button>
                )}
                <button onClick={clear}>clear</button>
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
                        <option value='hi'>Hindi</option>
                        <option value='bn'>Bengali</option>
                        <option value='en'>English</option>
                    </select>
                </div>
            </div>
            <div className="main-content">{transcript}</div>
            <div className="main-content">{answer}</div>
        </div>
    );
};

export default Tast1;
