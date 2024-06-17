import React, { useState, useEffect } from 'react';

const PunctuationAdder = () => {
  const [inputText, setInputText] = useState('');
  const [processedText, setProcessedText] = useState('');

  useEffect(() => {
    startSpeechRecognition();
  }, []);

  const startSpeechRecognition = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript;
          setInputText(prevInputText => prevInputText + ' ' + transcript);
          addPunctuation(transcript);
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
    };

    recognition.start();
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const addPunctuation = (text) => {
    let punctuatedText = text.trim();
    if (!/[.!?]$/.test(punctuatedText)) {
      punctuatedText += '.';
    }
    setProcessedText(prevProcessedText => prevProcessedText + ' ' + punctuatedText);
  };

  return (
    <div>
      <h1>Punctuation Adder</h1>
      <textarea
        value={inputText}
        onChange={handleInputChange}
        placeholder="Speak or enter your text here..."
        rows="10"
        cols="50"
      ></textarea>
      <br />
      <h2>Processed Text:</h2>
      <p>{processedText}</p>
    </div>
  );
};

export default PunctuationAdder;
