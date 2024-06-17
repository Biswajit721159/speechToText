import { useEffect, useState, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import nlp from 'compromise';
let result = null;

const Tast = () => {

    let [soluton, setsolution] = useState('');
    const [language, setLanguage] = useState('en-IN');
    const [sourceLanguage, setsourceLanguage] = useState('English');
    const [targetLanguage, settargetLanguage] = useState('Hindi');
    const [button, setbutton] = useState("Start");
    const [dissableSourceOption, setdissableSourceOption] = useState(false);
    const [dissableTargetOption, setdissableTargetOption] = useState(false);

    let { finalTranscript, transcript, interimTranscript, browserSupportsSpeechRecognition, resetTranscript }
        = useSpeechRecognition({ continuous: true, language: language });

    let [answer, setanswer] = useState('');
    const arr = useRef([]);


    // useEffect(() => {
    //     if (interimTranscript?.length === 0) {
    //         if (previousInterimMessage?.length !== 0) {
    //             if (soluton?.length === 0) {
    //                 let s = handlePunctuate(previousInterimMessage);
    //                 setsolution(s);
    //                 // setsolution(previousInterimMessage + '. ');
    //             } else {
    //                 let s = handlePunctuate(soluton + previousInterimMessage);
    //                 setsolution(s);
    //                 // setsolution(soluton + previousInterimMessage + '. ');
    //             }
    //         }
    //         setpreviousInterimMessage('');
    //     } else {
    //         setpreviousInterimMessage(interimTranscript)
    //     }
    // }, [interimTranscript])

    async function solveAnswer() {
        if (result === null && arr.current?.length !== 0) {
            result = "pending";
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

                let s = data.translatedText;
                let outputString = s.replace(/'/g, '');
                setanswer(outputString);

                s = data.PunctutionText;
                outputString = s.replace(/'/g, '');
                setsolution(outputString);

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
            if (numberOfWords(transcript) > 1) {
                arr.current.push(transcript);
            }
            solveAnswer();
        }, 500);
        return () => {
            clearInterval(interval);
        };
    }, [transcript]);

    if (!browserSupportsSpeechRecognition) {
        return null;
    }

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

    let sourcelanguageChange = (e) => {
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

    const clear = () => {
        stopListening();
        resetTranscript();
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
                {/* <button onClick={clear}>clear</button> */}
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
            <div className='main'>
                <div className="main-content"><span style={{ color: 'green' }}>Your speaking Text - </span>{transcript}</div>
                <div className="main-content"><span style={{ color: 'green' }}>Your speaking with Punctution Text - </span> {soluton}</div>
                <div className="main-content"><span style={{ color: 'green' }}>Your translated with Punctution Text - </span>{answer}</div>
            </div>
        </div >
    );
};

export default Tast;