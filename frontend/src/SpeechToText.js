import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Container, Typography } from '@mui/material';
import io from 'socket.io-client';
import useRecorder from './useRecorder';
import LanguageSelect from './LanguageSelect';

let socket;
let result = null;

const App = () => {
  const [transcriptions, setTranscriptions] = useState([]);

  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('en');

  const [dissableSourceOption, setdissableSourceOption] = useState(false)
  const [dissableTargetOption, setdissableTargetOption] = useState(false)

  const [SourceLanguage, setsourceLanguage] = useState('English');
  const [TargetLanguage, settargetLanguage] = useState('English');

  const arr = useRef([]);
  const audioRef = useRef([]);

  async function callSocketBackend() {
    if (result === null && arr.current?.length) {
      result = 'pending';
      const audioBlob = arr.current?.[0];
      audioRef.current.push(audioBlob);
      socket.emit('sendtoBackend', { audioBlob, SourceLanguage, TargetLanguage }, (response) => {
        console.log("response from backend ",response)
        if (response) {
          response = response.replace(/'/g, '');
          setTranscriptions(prevTranscriptions => [...prevTranscriptions, response]);
        }
        arr.current.shift();
        result = null;
        callSocketBackend();
      });
    }
  }

  const [recording, startRecording, stopRecording] = useRecorder(async (data) => {
    if (socket && socket.connected && data.size > 0) {
      console.log("Sending audio chunk to backend", data);
      arr.current.push(data);
      await callSocketBackend();
    } else {
      console.error("Socket is not connected");
    }
  });

  const initializeSocket = useCallback(() => {
    if (!socket) {
      socket = io('http://localhost:8080', {
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

  useEffect(() => {
    if (socket) {
      socket.emit('languageChange', { sourceLanguage, targetLanguage });
    }
  }, [sourceLanguage, targetLanguage]);

  const handleStopRecording = () => {
    stopRecording();
  };

  const playAudio = () => {
    if (recording) {
      stopRecording();
    }

    let i = 0;
    const interval = setInterval(() => {
      const aud = audioRef.current?.[i];
      if (aud) {
        const tmp = new Audio(URL.createObjectURL(aud));
        tmp.play();
        if (audioRef.current?.[i + 1]) {
          i++;
        } else {
          clearInterval(interval);
        }
      }
    }, 5000);
  };

  function sourcelanguageChange(e) {
    let value = e.target.value
    setSourceLanguage(value)
    if (value === "en") {
      setsourceLanguage('English')
    }
    else if (value === "hi") {
      setsourceLanguage('Hindi')
    } else if (value === "bn") {
      setsourceLanguage('Bengali')
    }
  }

  function targetlanguageChange(e) {
    let value = e.target.value
    setTargetLanguage(value)
    if (value === "en") {
      settargetLanguage('English')
    }
    else if (value === "hi") {
      settargetLanguage('Hindi')
    } else if (value === "bn") {
      settargetLanguage('Bengali')
    }
  }

  function handleStartRecording() {
    setdissableSourceOption(true)
    setdissableTargetOption(true)
    startRecording()
  }



  return (
    <Container>
      <h4 style={{ textAlign: 'center' }}>
        Real-time Language Translator
      </h4>
      <div className="selectform">
        <div>
          <label>Source Langauge</label>
          <select onChange={sourcelanguageChange} disabled={dissableSourceOption}>
            <option value='en'>English</option>
            <option value='hi'>Hindi</option>
            <option value='bn'>Bengali</option>
          </select>
        </div>
        <div>
          <label>Target Langauge</label>
          <select onChange={targetlanguageChange} disabled={dissableTargetOption}>
            <option value='en'>English</option>
            <option value='hi'>Hindi</option>
            <option value='bn'>Bengali</option>
          </select>
        </div>
      </div>
      <div style={containerStyle}>
        <button
          onClick={recording ? handleStopRecording : handleStartRecording}
          style={buttonStyle}
        >
          {recording ? 'Stop Recording' : 'Start Recording'}
        </button>

        {/* <button
          onClick={playAudio} style={buttonStyle}>
          Play Audio
        </button> */}
      </div>

      <Typography sx={{ mt: 2 }}>
        {transcriptions.join(' ')}
      </Typography>
    </Container>
  );
};

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const buttonStyle = {
  marginTop: '16px',
};

export default App;
