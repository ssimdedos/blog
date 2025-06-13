const express = require('express');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const dbPromise = require('./db/db');

const postRoutes = require('./routes/postRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboradRoutes = require('./routes/dashboradRoutes');

const app = express();

const port = process.env.SERVERPORT;
const BASE_URL = process.env.BASE_URL;

app.use(cors());
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, process.env.UPLOAD_PATH))); 

app.use(express.json()); // JSON 형식의 요청 본문을 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 형식의 요청 본문을 파싱

app.use('/api/posts', postRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/subcategory', subCategoryRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashboradRoutes);

app.get('/', (req, res) => {
  // res.sendFile(path.join(__dirname, 'public/index.html'));
  res.send('hello world');
});


app.listen(port, '0.0.0.0',()=> {
  console.log(`This app is listening on port '${BASE_URL}'`);
});

// db 종료
process.on('SIGINT', async () => {
  const db = await dbPromise;
  await db.close();
  console.log('Database closed');
  process.exit(0);  // 프로세스 종료
});