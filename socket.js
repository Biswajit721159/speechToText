const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const multer = require('multer');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
dotenv.config();
const OpenAI = require('openai')

const openai = new OpenAI({ apiKey: process.env.REACT_APP_ChatGptApiKey });

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const extension = file.mimetype.split('/')[1];
        cb(null, `${file.fieldname}-${Date.now()}.${extension}`);
    },
});

const upload = multer({ storage: storage });

async function transcribeAudio(filePath, targetLanguage, sourceLanguage) {
    // const form = new FormData();
    // form.append('file', fs.createReadStream(filePath));
    // form.append('model', 'whisper-1');
    // form.append('target_language', targetLanguage)
    // form.append('language', 'en')
    // console.log("filePath is ", filePath)
    try {
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-1",
            language: "en"
        })
        console.log(transcription);
        return transcription.text
    } catch (error) {
        return ''
    }

    // try {
    //     const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
    //         headers: {
    //             'Authorization': `Bearer ${process.env.REACT_APP_ChatGptApiKey}`,
    //             ...form.getHeaders()
    //         }
    //     });
    //     let data = response?.data?.text;
    //     if (data?.length === 0) {
    //         return data
    //     }
    //     console.log("result from open ai whisper - ",data)
    //     return data;

    //     // let apikey = process.env.REACT_APP_ChatGptApiKey
    //     // let api = process.env.chat_url
    //     // const payload = {
    //     //     "model": "gpt-3.5-turbo",
    //     //     "messages": [{
    //     //         "role": "system", "content": `You will be provided with a sentence, and your task is to translate it into ${targetLanguage}
    //     //     . If you did not convert it into the ${targetLanguage} language then do not return anything.`
    //     //     },
    //     //     { "role": "user", "content": data }],
    //     //     "temperature": 0
    //     // }
    //     // headergpt = {
    //     //     'Authorization': `Bearer ${apikey}`,
    //     //     'Content-Type': 'application/json',
    //     // }
    //     // const finalResponse = await axios.post(api, payload, { headers: headergpt })
    //     // let response_data = finalResponse?.data?.choices?.[0]?.message?.content
    //     // return response_data

    // } catch (error) {
    //     if (error.response) {
    //         console.log('Status:', error.response.status);
    //         console.log('Headers:', JSON.stringify(error.response.headers, null, 2));
    //         console.log('Data:', JSON.stringify(error.response.data, null, 2));
    //     } else {
    //         console.log('Error Message:', error.message);
    //     }
    //     console.log("error");
    //     throw error;
    // } finally {
    //     fs.unlink(filePath, (err) => {
    //         if (err) {
    //             console.error('Failed to delete file:', err);
    //             res.status(500).json({ error: 'Failed to delete uploaded file.' });
    //         }
    //     });
    // }

}

app.post('/transcribe', upload.single('file'), async (req, res) => {
    const filePath = req.file.path;
    const targetLanguage = req.body.targetLanguage;
    const sourceLanguage = req.body.sourceLanguage;
    try {
        const transcription = await transcribeAudio(filePath, targetLanguage, sourceLanguage);
        res.json({ transcription });
    } catch (error) {
        res.status(500).json({ error: 'Failed to transcribe audio' });
    } finally {
        fs.unlink(filePath, (err) => {
            if (err) console.error('Failed to delete file:', err);
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

