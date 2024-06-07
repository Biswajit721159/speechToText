import React, { useState, useEffect } from 'react';
import { Button, Container, Typography } from '@mui/material';
import axios from 'axios';
import useRecorder from './useRecorder';
import LanguageSelect from './LanguageSelect';

function App() {
  const [recording, startRecording, stopRecording, audioBlob] = useRecorder();
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    transcribeAudio();
  }, [audioBlob, targetLanguage]);

  const transcribeAudio = async () => {
    if (audioBlob) {
      const formData = new FormData();
      console.log(audioBlob)
      formData.append('file', audioBlob);
      formData.append('targetLanguage', targetLanguage);
      formData.append('sourceLanguage', sourceLanguage);

      try {
        const response = await axios.post('http://localhost:4000/transcribe', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setTranscription(response?.data?.transcription);
        setError('');
      } catch (error) {
        if (error.response) {
          console.error('Server Error:', error.response.data);
          setError('An error occurred during transcription. Please try again later.');
        } else if (error.request) {
          console.error('Network Error:', error.request);
          setError('A network error occurred. Please check your internet connection and try again.');
        } else {
          console.error('Error:', error.message);
          setError('An unexpected error occurred. Please try again later.');
        }
      }
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Language Translator</Typography>
      <LanguageSelect
        label="Source Language"
        value={sourceLanguage}
        sx={{ mt: 2 }}
        onChange={(e) => setSourceLanguage(e.target.value)}
      />
      <LanguageSelect
        sx={{ mt: 2 }}
        label="Target Language"
        value={targetLanguage}
        onChange={(e) => setTargetLanguage(e.target.value)}
      />
      <Button
        variant="contained"
        onClick={recording ? stopRecording : startRecording}
        sx={{ mt: 2 }}
      >
        {recording ? 'Stop Recording' : 'Start Recording'}
      </Button>
      {error && <Typography variant="body1" sx={{ mt: 2, color: 'red' }}>{error}</Typography>}
      <Typography variant="body1" sx={{ mt: 2 }}>{transcription}</Typography>
    </Container>
  );
}

export default App;

