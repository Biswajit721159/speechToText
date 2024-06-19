import { useEffect, useState, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
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

  async function solveAnswer() {
    if (result === null && arr.current?.length !== 0) {
      result = "pending";
      let textData = arr.current?.[0];
      let api = process.env.REACT_APP_API
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
    else if (value === "sp") {
      settargetLanguage('Spanish');
    }
    else if (value === "fr") {
      settargetLanguage('French');
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

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Speech to Text Converter</h2>
      <div className="flex space-x-4 mb-6">
        {button === "Start" ? (
          <button onClick={startListening} className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">{button}</button>
        ) : (
          <button onClick={stopListening} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">{button}</button>
        )}
        <button onClick={refreshPage} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Clear</button>
      </div>
      <div className="flex flex-col md:flex-row space-x-0 md:space-x-8 space-y-4 md:space-y-0 mb-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Source Language</label>
          <select onChange={sourcelanguageChange} disabled={dissableSourceOption} className="block w-full p-2 border border-gray-300 rounded">
            <option value='en'>English</option>
            <option value='hi'>Hindi</option>
            <option value='bn'>Bengali</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Target Language</label>
          <select onChange={targetlanguageChange} disabled={dissableTargetOption} className="block w-full p-2 border border-gray-300 rounded">
            <option value='hi'>Hindi</option>
            <option value='bn'>Bengali</option>
            <option value='en'>English</option>
            <option value='sp'>Spanish</option>
            <option value='fr'>French</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md"> {/* 50% width on md screens and below */}
          <p className="text-green-600 font-semibold">Your speaking Text:</p>
          <div className="w-full  rounded-lg p-4 overflow-auto h-auto"> {/* Full width and auto height */}
            <p className="mt-2">{transcript}</p>
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md"> {/* 50% width on md screens and below */}
          <p className="text-green-600 font-semibold">Your speaking with Punctuation Text:</p>
          <div className="w-full  rounded-lg p-4 overflow-auto h-auto"> {/* Full width and auto height */}
            <p className="mt-2">{soluton}</p>
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md md:col-span-2"> {/* Full width on all screens */}
          <p className="text-green-600 font-semibold">Your translated with Punctuation Text:</p>
          <div className="w-full rounded-lg p-4 overflow-auto h-auto"> {/* Full width and auto height */}
            <p className="mt-2">{answer}</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Tast;
