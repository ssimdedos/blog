const express = require('express');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const dbPromise = require('./db/db');

const postRoutes = require('./routes/postRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');

const app = express();

const port = process.env.SERVERPORT;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json()); // JSON 형식의 요청 본문을 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 형식의 요청 본문을 파싱

app.use('/api/posts', postRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/subcategory', subCategoryRoutes);

app.get('/', (req, res) => {
  // res.sendFile(path.join(__dirname, 'public/index.html'));
  res.send('hello world');
});


app.listen(port, ()=> {
  console.log(`This app is listening on port 'ec2-3-27-135-106.ap-southeast-2.compute.amazonaws.com:${port}'`);
});

// db 종료
process.on('SIGINT', async () => {
  const db = await dbPromise;
  await db.close();
  console.log('Database closed');
  process.exit(0);  // 프로세스 종료
});