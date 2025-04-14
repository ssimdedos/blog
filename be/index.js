const express = require('express');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
// const apiRouter = require('./routes/api');

const app = express();

const port = process.env.SERVERPORT;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
  res.send('hello world');
});


app.listen(port, ()=> {
  console.log(`This app is listening on port 'http://ec2-3-27-255-124.ap-southeast-2.compute.amazonaws.com:${port}'`);
});