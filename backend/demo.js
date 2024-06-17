let axios = require('axios');
const apiToken = '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';
const translate = require('translate-google');
const dotenv = require('dotenv');
dotenv.config();
const OpenAI = require('openai');
// const openai = new OpenAI({ apiKey: process.env.REACT_APP_ChatGptApiKey });

// const fetchData = async () => {
//     const url = 'https://api-inference.huggingface.co/models/softcatala/fullstop-catalan-punctuation-prediction';
//     const apiKey = apiToken;

//     const headers = {
//         'Authorization': `Bearer ${apiKey}`,
//         'Content-Type': 'application/json'
//     };

//     const data = {
//         inputs: "Certainly! Choosing a good model depends on your specific task and requirements. Here are some popular and well-regarded models on the Hugging Face Model Hub that you can consider for various natural language processing tasks, including text generation, translation, sentiment analysis, and punctuation correction."
//     };

//     try {
//         const response = await axios.post(url, data, { headers });
//         console.log('Response data:', response.data);
//     } catch (error) {
//         console.error('Error fetching data:');
//     }
// };

// async function fetchData(text) {
//     const translatedText = await translate(text, { to: 'English' });
//     console.log('Translated text:', translatedText);
// }


const fetchData = async (text) => {
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
        console.log(response_data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};

let text = `
C++ is an object-oriented programming (OOP) language that is viewed by many as 
the best language for creating large-scale applications C++ is a superset of the C language
A related programming language, Java, is based on C++ but optimized for the distribution of 
program objects in a network such as the internet Java is somewhat simpler and easier to learn 
than C++ and has characteristics that give it other advantages over C++. However
both languages require a considerable amount of study
C++ allows software developers to define their own data types and manipulate them using functions and methods
It also allows low-level programming and provides access to memory, enabling fast and efficient execution of code
It also supports generic programming using templates, which let code be written in a generic form and reused for different data types
`
fetchData(text);
