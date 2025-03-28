require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const { WebSocketServer } = require("ws");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
const server = http.createServer(app);

const allowedOriginSocket = [
  'http://localhost',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5500',
  'https://kanglerian-switch.vercel.app',
  '*'
];

const wss = new WebSocketServer({ server });

app.use(cors({
  origin: allowedOriginSocket,
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

wss.on("connection", (ws) => {
  console.log("Client terhubung!");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      if (data.event === "switch-lamp") {
        console.log("Lampu diubah:", data.value);

        // Kirim pesan ke semua client (termasuk ESP8266)
        wss.clients.forEach((client) => {
          if (client.readyState === ws.OPEN) {
            client.send(data.value == "1" ? "ON" : "OFF");
          }
        });
      }
    } catch (err) {
      console.error("Error parsing message:", err);
    }
  });


  ws.on("close", () => {
    console.log("Client terputus");
  });
});
module.exports = { app, server };
