const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios')
dotenv.config();

app.use(cors());
app.use(cors({
    origin: '*',
    methods: 'GET, POST, PUT, DELETE, PATCH',
    allowedHeaders: 'Content-Type',
}));

const translate = require('translate-google');

io.on('connection', (socket) => {
    console.log("socket is connected")
    socket.on('sendToBackend', async ({ chunk, sourceLanguage, targetLanguage }, callback) => {
        try {
            console.log("chunk is coming from  frontend --- ", chunk, '\n\n')
            console.log("sourceLanguage is ", sourceLanguage, '\n')
            console.log("targetLanguage is ", targetLanguage, '\n')

            if (sourceLanguage === targetLanguage) {
                // socket.emit('sendToFrontend', chunk)
                callback(chunk)
                return;
            }
            if (numberOfWords(chunk) <= 1) { callback(chunk) }
            const translatedText = await translate(chunk, { to: targetLanguage });
            console.log("translatedText is ", translatedText)
            callback(translatedText)

            // let apikey = process.env.REACT_APP_ChatGptApiKey;
            // let api = process.env.chat_url;

            // const payload = {
            //     "model": "gpt-4o",
            //     "messages": [{
            //         "role": "system",
            //         "content": `You will be provided with a sentence in ${sourceLanguage} language, and your task is to translate it into ${targetLanguage} language.
            //                    This sentence provided is an audio transcription so it is bound to contain several errors. Please take this into account. 
            //                    Based on the context, correct the errors in the input source and then provide the translation.
            //                    Provide only the translation, and not the corrected sentence.`
            //     },
            //     { "role": "user", "content": chunk }],
            //     "temperature": 0
            // };

            // const headergpt = {
            //     'Authorization': `Bearer ${apikey}`,
            //     'Content-Type': 'application/json',
            // };
            // const finalResponse = await axios.post(api, payload, { headers: headergpt });
            // let response_data = finalResponse?.data?.choices?.[0]?.message?.content;
            // console.log("response_data from open ai  is ", response_data, '\n\n');
            // // socket.emit('sendToFrontend', response_data)
            // if (response_data?.length !== 0 && response_data != "") callback(response_data)
            // else callback('')

        } catch {
            callback('Not possible to convert!')
        }
    })
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

function numberOfWords(str) {
    const words = str.match(/\S+/g);
    if (words.length !== 0) {
        return words.length;
    }
    else {
        return 0;
    }
}

app.get('/', async (req, res) => {
    res.send("server is running.....")
})

server.listen(2000, () => {
    console.log('Server is running on port 2000');
});