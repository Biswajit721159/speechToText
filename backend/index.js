const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const translate = require('translate-google');
const io = socketIO(server, {
  transports: ['websocket', 'polling'],
  path: '/api/socket.io'
});

const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type'],
}));


app.get("/", async (req, res) => {
  res.send("server is running ...")
})

const PORT = 2000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});