const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');
const ffmpeg = require('fluent-ffmpeg');
const { execSync } = require('child_process');
const { Blob } = require('buffer'); // Ensure to include Blob from the correct package
const axios = require('axios')

dotenv.config();

const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.REACT_APP_ChatGptApiKey });

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(cors());

const OPENAI_API_KEY = process.env.REACT_APP_ChatGptApiKey;

let audioBuffer = [];

function isSilent(audioPath) {
    try {
        const result = execSync(`ffmpeg -i ${audioPath} -af silencedetect=n=-50dB:d=1 -f null - 2>&1 | grep 'silence_end'`);
        return result.length > 0;
    } catch (error) {
        return false;
    }
}

function reduceNoise(inputPath, outputPath, callback) {
    ffmpeg(inputPath)
        .outputOptions(['-af', 'afftdn'])
        .on('end', () => callback(null, outputPath))
        .on('error', (err) => callback(err, null))
        .save(outputPath);
}

function filterTranscription(text) {
    const unwantedPhrases = [
        "Thank you", "Thanks for watching", "Bye bye", "any creations", "Bye", 'bye'
    ];
    const regex = new RegExp(unwantedPhrases.join("|"), "gi");
    const filteredText = text.replace(regex, "").trim();
    return filteredText.length > 0 ? filteredText : "";
}

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('languageChange', (data) => {
        console.log('Language changed:', data);
    });

    socket.on('audioChunk', (chunk) => {
        audioBuffer.push(chunk);
    });

    socket.on('sendtoBackend', async (language, callback) => {
        try {
            const chunk = language.audioBlob;
            audioBuffer.push(chunk);
            if (!Array.isArray(audioBuffer) || audioBuffer.length === 0) {
                throw new Error('Invalid audio buffer');
            }
            const audioBlob = new Blob(audioBuffer, { type: 'audio/mp3' });
            const arrayBuffer = await audioBlob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            audioBuffer = [];
            const originalFilePath = `uploads/original-file-${Date.now()}.mp3`;
            const processedFilePath = `uploads/processed-file-${Date.now()}.mp3`;
            fs.writeFileSync(originalFilePath, buffer);

            if (isSilent(originalFilePath)) {
                console.log('Silent audio detected');
                callback('');
                fs.unlink(originalFilePath, () => { });
                return;
            }

            reduceNoise(originalFilePath, processedFilePath, async (err) => {
                if (err) {
                    console.error('Error reducing noise:', err);
                    callback('');
                    fs.unlink(originalFilePath, () => { });
                    return;
                }

                try {
                    const transcription = await openai.audio.transcriptions.create({
                        file: fs.createReadStream(processedFilePath),
                        model: "whisper-1",
                        language: 'en',
                        // prompt: 'If The audio is silent then return a empty string . please do not return other string.'
                    });

                    let sourceLanguage = language?.SourceLanguage;
                    let targetLanguage = language?.TargetLanguage;

                    if (transcription?.text?.length === 0) {
                        callback(transcription?.text)
                        return;
                    }

                    console.log("transcription?.text is ", transcription?.text)

                    let apikey = process.env.REACT_APP_ChatGptApiKey;
                    let api = process.env.chat_url;

                    const payload = {
                        "model": "gpt-3.5-turbo",
                        "messages": [{
                            "role": "system",
                            "content": `You will be provided with a sentence in English, and your task is to translate it into ${targetLanguage} langauge.
                                        if it is not possible then return the given string.
                                        i do not want 'Please provide me with a sentence to translate.',
                                        'I cannot provide a translation without a sentence to work with' kind of sentence as a return value .
                                        also return the given string in place of this.`
                        },
                        { "role": "user", "content": transcription?.text }],
                        "temperature": 0
                    };

                    const headergpt = {
                        'Authorization': `Bearer ${apikey}`,
                        'Content-Type': 'application/json',
                    };
                    const finalResponse = await axios.post(api, payload, { headers: headergpt });
                    let response_data = finalResponse?.data?.choices?.[0]?.message?.content;
                    // console.log("response_data is ", response_data, response_data?.length)
                    if (response_data?.length === 0) {
                        callback(transcription?.text)
                    }
                    else callback(response_data)
                } catch (error) {
                    console.error('Error transcribing audio:', error?.message);
                    callback('');
                } finally {
                    fs.unlink(originalFilePath, () => { });
                    fs.unlink(processedFilePath, () => { });
                }
            });
        } catch (error) {
            console.error('Error processing audio:', error.message);
            callback('');
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(8080, () => {
    console.log('Server is running on port 8080');
});
