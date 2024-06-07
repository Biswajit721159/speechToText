import { useState, useEffect, useRef } from 'react';

const useRecorder = (onData) => {
    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef(null);

    const handleDataAvailable = (event) => {
        if (event.data.size > 0) {
            onData(event.data);
        }
    };

    const recordAudio = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100,
            },
        });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
    };

    const startRecording = async () => {
        setRecording(true);
        await recordAudio();
        mediaRecorderRef?.current?.start(3000);
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (recording) {
                mediaRecorderRef?.current?.stop();
                mediaRecorderRef?.current?.start(2000);
            }
        }, 2000);

        return () => {
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.removeEventListener('dataavailable', handleDataAvailable);
            }
            clearInterval(interval);
        }
    }, [recording]);

    const stopRecording = () => {
        mediaRecorderRef?.current?.stop();
        setRecording(false);
    }

    return [recording, startRecording, stopRecording];
};

export default useRecorder;
