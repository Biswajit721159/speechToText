const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
// const socketIO = require('socket.io');
const app = express();
app.use(bodyParser.json());
const server = http.createServer(app);
const translate = require('translate-google');
// const io = socketIO(server, {
//   transports: ['websocket', 'polling'],
//   path: '/api/socket.io'
// });

const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type'],
}));



// io.on('connection', (socket) => {
//   console.log('Socket connected:', socket.id);

//   socket.on('sendToBackend', async ({ chunk, sourceLanguage, targetLanguage }, callback) => {
//     try {
//       console.log('Chunk from frontend:', chunk);
//       console.log('Source language:', sourceLanguage);
//       console.log('Target language:', targetLanguage);

//       if (sourceLanguage === targetLanguage) {
//         callback(chunk);
//         return;
//       }
//       if (numberOfWords(chunk) <= 1) {
//         callback(chunk);
//         return;
//       }

//       const translatedText = await translate(chunk, { to: targetLanguage });
//       console.log('Translated text:', translatedText);
//       callback(translatedText);
//     } catch (error) {
//       console.error('Translation error:', error);
//       callback('Not possible to convert!');
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// });

// function numberOfWords(str) {
//   const words = str.match(/\S+/g);
//   return words ? words.length : 0;
// }

app.post("/", async (req, res) => {
  try {
    let chunk = req.body.chunk
    let targetLanguage = req.body.targetLanguage;
    console.log('Chunk from frontend:', chunk, targetLanguage);
    const translatedText = await translate(chunk, { to: targetLanguage });
    console.log('Translated text:', translatedText);
    res.send({ text: translatedText })
  } catch {
    res.send("The Application is deploy in vercel which is free");
  }
})


app.get("/", async (req, res) => {
  res.send("server is running ...")
})

const PORT = 2000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});