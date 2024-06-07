import React, { useState, useEffect, useRef } from 'react';

function SpeechToText() {
    const [isRecording, setIsRecording] = useState(false);
    // const [chunks, setChunks] = useState([]);
    const audioRef = useRef([]);

    const mediaRecorderRef = useRef(null);

    useEffect(() => {
        console.log("isRecording ", isRecording)
        if (!mediaRecorderRef.current && isRecording) {
            const constraints = { audio: true };
            navigator.mediaDevices
                .getUserMedia(constraints)
                .then(mediaStream => {
                    const recorder = new MediaRecorder(mediaStream);
                    recorder.ondataavailable = event => {
                        const blob = event.data;
                        audioRef.current.push(blob);
                        console.log("blob is ", blob);
                    };
                    recorder.start(2000);
                });
        }
    }, [isRecording]);


    const startRecording = () => {
        // if (!isRecording && mediaRecorderRef.current) {
        setIsRecording(true);
        mediaRecorderRef?.current?.start(100);
        const intervalId = setInterval(sendChunksToServer, 3000);
        return () => clearInterval(intervalId);
        // }
    };

    const stopRecording = () => {
        // if (isRecording && mediaRecorderRef.current) {
        setIsRecording(false);
        mediaRecorderRef?.current?.stop();
        // }
    };

    const sendChunksToServer = () => { }

    const play = () => {
        console.log("audioRef ", audioRef)
        if (isRecording) {
            stopRecording()
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

    return (
        <div>
            <button onClick={startRecording} disabled={isRecording}>
                Start Recording
            </button>
            <button onClick={stopRecording} disabled={!isRecording}>
                Stop Recording
            </button>
            <button onClick={play}>play song</button>
            {isRecording && <p>Recording...</p>}
        </div>
    );
}

export default SpeechToText;
