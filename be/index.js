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
const tagRoutes = require('./routes/tagRoutes');

const app = express();
app.set('trust proxy', true);
const port = process.env.SERVERPORT;
// const BASE_URL = process.env.BASE_URL;

app.use(cors());
// app.use(express.static(path.join(__dirname, 'public')));
// app.use('/images', express.static(path.join(__dirname, process.env.UPLOAD_PATH))); 
app.use('/images', (req, res, next) => {
    // console.log(`[Backend Log] Image request received: ${req.originalUrl}`);
    // 실제 파일 시스템 경로를 로그로 출력하여 확인
    const requestedFilePath = path.join(process.env.UPLOAD_PATH, req.url.slice(1)); // '/images/' 제거 후 파일 경로 생성
    // console.log(`[Backend Log] Attempting to serve file: ${requestedFilePath}`);
    next(); // express.static 미들웨어로 요청 전달
}, express.static(process.env.UPLOAD_PATH, {
    setHeaders: (res, path, stat) => {
        console.log(`[Backend Log] Successfully serving: ${path}`);
    }
}));

app.use(express.json()); // JSON 형식의 요청 본문을 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 형식의 요청 본문을 파싱

app.use('/api/posts', postRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/subcategory', subCategoryRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashboradRoutes);
app.use('/api/tag', tagRoutes);

app.get('/', (req, res) => {
  // res.sendFile(path.join(__dirname, 'public/index.html'));
  res.send('hello world');
});


app.listen(port, '0.0.0.0',()=> {
  console.log(`This app is listening on port http://localhost/`);
});

// db 종료
process.on('SIGINT', async () => {
  const db = await dbPromise;
  await db.close();
  console.log('Database closed');
  process.exit(0);  // 프로세스 종료
});
