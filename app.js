const express = require('express');
const path = require('path');
const http = require('http');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const { Server } = require('socket.io');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
const server = http.createServer(app);

const allowedOriginSocket = [
  'http://localhost',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5500',
  '*',
];

const io = new Server(server, {
  cors: {
    origin: allowedOriginSocket,
    methods: ['GET', 'POST'],
  }
});

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

io.on('connection', (socket) => {
  console.log('client connected');

  socket.on('switch-lamp', (data) => {
    console.log('switch', data);
  });
});

module.exports = {app, server};
