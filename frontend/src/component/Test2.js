import React, { useState, useEffect } from 'react';

const SpeechToText = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  useEffect(() => {
    let recognition = new window.webkitSpeechRecognition(); // Create SpeechRecognition object

    recognition.continuous = true; // Set continuous listening
    recognition.interimResults = true; // Get interim results

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          setTranscript(prevTranscript => prevTranscript + event.results[i][0].transcript);
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
    };

    if (listening) {
      recognition.start(); // Start listening
    } else {
      recognition.stop(); // Stop listening
    }

    return () => {
      recognition.stop(); // Clean up on component unmount
    };
  }, [listening]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Send transcript to backend in chunks every 3 seconds
      if (transcript !== '') {
        console.log("Send to backend:", transcript);
        setTranscript('');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [transcript]);

  const toggleListening = () => {
    setListening(prevState => !prevState);
  };

  return (
    <div>
      <button onClick={toggleListening}>
        {listening ? 'Stop Listening' : 'Start Listening'}
      </button>
      <p>{transcript}</p>
    </div>
  );
};

export default SpeechToText;
