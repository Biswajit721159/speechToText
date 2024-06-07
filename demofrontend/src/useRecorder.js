import { useState, useEffect } from 'react';

const useRecorder = () => {
  const [audioBlob, setAudioBlob] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (recorder === null) {
      if (recording) {
        requestRecorder().then(setRecorder, console.error);
      }
      return;
    }

    if (recording) {
      recorder.start();
    } else {
      recorder.stop();
    }

    const handleData = e => {
      setAudioBlob(e.data);
    };

    recorder.addEventListener('dataavailable', handleData);
    return () => recorder.removeEventListener('dataavailable', handleData);
  }, [recorder, recording]);

  const startRecording = () => setRecording(true);
  const stopRecording = () => setRecording(false);

  return [recording, startRecording, stopRecording, audioBlob];
};

async function requestRecorder() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  return new MediaRecorder(stream);
}

export default useRecorder;
