import React, { useState, useEffect } from 'react';

const AudioRecorder = () => {
    const [mediaStream, setMediaStream] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);

    useEffect(() => {
        // Get user media stream
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                setMediaStream(stream);
                // Create media recorder
                const recorder = new MediaRecorder(stream);
                setMediaRecorder(recorder);

                recorder.ondataavailable = event => {
                    if (event.data.size > 0) {
                        setAudioChunks(prevChunks => [...prevChunks, event.data]);
                    }
                };

                // Start recording
                recorder.start();

                // Schedule sending chunks to backend every 2 seconds
                const interval = setInterval(() => {
                    if (audioChunks.length > 0) {
                        // Send chunks to backend
                        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                        sendAudioToBackend(audioBlob);
                        // Clear recorded chunks
                        setAudioChunks([]);
                    }
                }, 2000);

                return () => {
                    clearInterval(interval);
                    recorder.stop();
                    stream.getTracks().forEach(track => track.stop());
                };
            })
            .catch(error => {
                console.error('Error accessing microphone:', error);
            });
    }, []); // Empty dependency array to run only once

    const sendAudioToBackend = audioBlob => {
        console.log(audioBlob)
        // Code to send audioBlob to backend using fetch or any other method
        // Example:
        // fetch('your-backend-url', {
        //   method: 'POST',
        //   body: audioBlob
        // })
        // .then(response => {
        //   // Handle response
        // })
        // .catch(error => {
        //   console.error('Error sending audio to backend:', error);
        // });
    };

    return (
        <div>
            {/* Your UI elements */}
        </div>
    );
};

export default AudioRecorder;
