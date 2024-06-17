const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const server = http.createServer(app);
const translate = require('translate-google');
const dotenv = require('dotenv');
const cors = require('cors');
let axios = require('axios');
dotenv.config();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type'],
}));


const fetchDataForPunctution = async (text) => {
  try {
    let apikey = process.env.REACT_APP_ChatGptApiKey;
    let api = process.env.chat_url;
    const payload = {
      "model": "gpt-4",
      "messages": [
        {
          "role": "system",
          "content": `You are given a sentence. Now you need to punctuate that sentence and return it.
                   If it is not possible to punctuate, return the original string.`
        },
        {
          "role": "user",
          "content": text
        }
      ],
      "temperature": 0
    };

    const headers = {
      'Authorization': `Bearer ${apikey}`,
      'Content-Type': 'application/json',
    };

    const finalResponse = await axios.post(api, payload, { headers });
    let response_data = finalResponse?.data?.choices?.[0]?.message?.content;
    return response_data
  } catch (error) {
    return error?.message
  }
};

const fetchDataForTranslate = async (text, targetLanguage) => {
  try {
    const translatedText = await translate(text, { to: targetLanguage });
    return translatedText
  } catch (error) {
    return error?.message
  }
};

app.post("/", async (req, res) => {
  try {
    let { chunk, targetLanguage } = req.body;
    let PunctutionText = await fetchDataForPunctution(chunk);
    let translatedText = await fetchDataForTranslate(PunctutionText, targetLanguage);
    console.log("PunctutionText ", PunctutionText);
    console.log("translatedText", translatedText);
    res.send({ 'translatedText': translatedText, 'PunctutionText': PunctutionText });
  } catch {
    res.send("The Application is deploy in vercel which is free. many request is not accepted.");
  }
})

app.get("/", async (req, res) => {
  res.send("server is running ...");
})

const PORT = 4000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});