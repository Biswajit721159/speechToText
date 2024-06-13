import { useEffect, useState, useCallback, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import nlp from 'compromise';
import io from 'socket.io-client';
let socket;
let result = null;

const Tast = () => {

    let [soluton, setsolution] = useState('');
    let [previousInterimMessage, setpreviousInterimMessage] = useState('');
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

    const handlePunctuate = (inputText) => {
        const doc = nlp(inputText);
        const sentences = doc.sentences().out('array');
        const punctuatedText = sentences.join('. ') + (sentences.length ? '.' : '');
        return punctuatedText;
    };

    useEffect(() => {
        if (interimTranscript) {
            setChunks(interimTranscript);
        }
    }, [interimTranscript]);

    useEffect(() => {
        if (interimTranscript?.length === 0) {
            if (previousInterimMessage?.length !== 0) {
                if (soluton?.length === 0) {
                    let s = handlePunctuate(previousInterimMessage);
                    setsolution(s);
                    // setsolution(previousInterimMessage + '. ');
                } else {
                    let s = handlePunctuate(soluton + previousInterimMessage);
                    setsolution(s);
                    // setsolution(soluton + previousInterimMessage + '. ');
                }
            }
            setpreviousInterimMessage('');
        } else {
            setpreviousInterimMessage(interimTranscript)
        }
    }, [interimTranscript])

    async function solveAnswer() {
        if (result === null && arr.current?.length !== 0) {
            result = "pending";
            let chunk = chunks;
            setChunks('');
            let textData = arr.current?.[0];
            // let api = "http://localhost:4000/"
            let api = "https://speech-to-textbackend.vercel.app/"
            fetch(`${api}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chunk: textData,
                    targetLanguage: targetLanguage,
                    sourceLanguage: sourceLanguage
                })
            }).then(responce => responce.json()).then((data) => {
                let s = data.text;
                let outputString = s.replace(/'/g, '');
                setanswer(outputString);
                result = null;
                arr.current.shift();
                solveAnswer();
            }).catch((error) => {
                console.log(error)
                solveAnswer();
            })
        }
    }

    useEffect(() => {
        let interval = setTimeout(() => {
            let paragraph = soluton + ' ' + previousInterimMessage;
            if (paragraph?.length !== 0 && numberOfWords(paragraph) > 1) {
                arr.current.push(paragraph);
            }
            solveAnswer();
        }, 500);
        return () => {
            clearInterval(interval);
        };
    }, [transcript]);

    // const initializeSocket = useCallback(() => {
    //     if (!socket) {
    //         socket = io('http://23.23.25.176:2000', {
    //             transports: ['websocket', 'polling'],
    //             path: '/api/socket.io'  // Ensure this matches the path in your backend
    //         });
    //         socket.on('connect', () => {
    //             console.log("Connected to backend");
    //         });
    //         socket.on('disconnect', () => {
    //             console.log("Disconnected from backend");
    //         });
    //     }
    // }, []);
    // useEffect(() => {
    //     initializeSocket();
    //     return () => {
    //         if (socket) {
    //             socket.disconnect();
    //             socket = null;
    //         }
    //     };
    // }, [initializeSocket]);

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
            <div className="main-content">{soluton + ' ' + previousInterimMessage}</div>
            <div className="main-content">{answer}</div>
        </div>
    );
};

export default Tast;
