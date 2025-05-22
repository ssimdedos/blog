const db = require('../db/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const UPLOAD_PATH = path.join(__dirname, '../', 'uploads/images');
const BASE_URL = 'http://localhost:7303';
// 없으면 업로드폴더 생성
try {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true }); // recursive: true는 상위 디렉토리도 함께 생성
  console.log(`Upload directory '${UPLOAD_PATH}' created or already exists.`);
} catch (err) {
  console.error(`Error creating upload directory: ${err}`);
}

// multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 이미지 저장 경로 지정
    const date = new Date();
    const date2 = String(date.getFullYear()) + '_' + (date.getMonth() + 1).toString().padStart(2, '0') + '_' + date.getDate().toString().padStart(2, '0');
    const todayUploadDir = path.join(UPLOAD_PATH, date2);
    fs.mkdir(todayUploadDir, { recursive: true }, (err) => {
      if (err) return cb(err);
      cb(null, todayUploadDir);
    });
  },
  filename: function (req, file, cb) {
    // 저장 파일 이름 지정
    // 예: myimage.jpg -> myimage_16789012345.jpg
    const ext = path.extname(file.originalname); // 원본 파일의 확장자 (.jpg, .png 등)
    const fileName = path.basename(file.originalname, ext); // 확장자를 제외한 파일명
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // 고유한 접미사
    cb(null, fileName + '_' + uniqueSuffix + ext); // 최종 파일명
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 5MB로 파일 크기 제한 (선택 사항, 필요에 따라 조정)
  },
  fileFilter: function (req, file, cb) {
    // 허용할 파일 타입 (이미지만 허용)
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype); // 파일 MIME 타입 검사
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // 파일 확장자 검사

    if (mimetype && extname) {
      return cb(null, true); // 파일 허용
    } else {
      cb(new Error('Only images (jpeg, jpg, png, gif, webp) are allowed!')); // 파일 거부 및 에러 메시지
    }
  }
}).single('file'); // 'file'은 클라이언트에서 FormData.append("file", ...) 할 때 사용한 필드 이름입니다.
// 여러 파일을 한 번에 업로드하려면 .array('files', maxCount) 또는 .fields([{ name: 'avatar' }, { name: 'gallery' }]) 사용




exports.getAllPosts = (req, res) => {
  // console.log(req.query.categoryId);
  const id = req.query.categoryId;
  let query = 'SELECT * FROM posts';
  let query2 = 'SELECT name FROM categories';

  if (id != 'all') {
    // console.log('카테고리 들어옴');
    query = query + ` WHERE category_id=${id}`;
    query2 = query2 + ` WHERE id=${id}`;
    // console.log(query);
  } else {
    // console.log('all들어옴');
  }
  db.all(query, (err, rows1) => {
    if (err) {
      console.log(err);
      return res.status(500).send('DB err post.get');
    } else {
      if (id != 'all') {
        db.all(query2, (err, rows2) => {
          if (err) {
            console.log(err);
            return res.status(500).send('DB err categories.get name');
          } else {
            // console.log(rows2);
            res.json({ data1: rows1, data2: rows2 });
          }
        });
      } else {
        res.json(rows1);
      }
    }
  });
}

exports.uploadImages = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('img업로드 에러: ', err);
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: '파일 업로드 실패패' });
    }
    console.log("파일 업로드 성공: ", req.file);

    const fileUrl = `${BASE_URL}/images/${path.relative(UPLOAD_PATH, req.file.path).replace(/\\/g, '/')}`;
    // console.log(path.relative(UPLOAD_PATH, req.file.path).replace(/\\/g, '/'));
    res.status(200).json({
      success: true,
      message: '이미지 저장 완료',
      url: fileUrl, // 클라이언트에서 사용할 이미지 URL
      fileName: req.file.filename, // 저장된 파일명
      filePath: req.file.path
    });
  });
};

exports.moveImagesToPostFolder = async (oldFilePaths, postId) => {
  if (!oldFilePaths || oldFilePaths.length === 0 || !postId) {
    return []; // 이동할 파일이 없거나 postId가 없으면 빈 배열 반환
  }

  const NEW_POST_PATH = path.join(UPLOAD_PATH, String(postId));
  const newFileUrls = [];

  try {
    // 게시글 ID 디렉토리 생성
    await fs.promises.mkdir(NEW_POST_PATH, { recursive: true });
    console.log(`해당 게시글 폴더가 '${NEW_POST_PATH}'생성 혹은 이미 존재합니다다.`);

    for (const oldPath of oldFilePaths) {
      const fileName = path.basename(oldPath);
      const newPath = path.join(NEW_POST_PATH, fileName);

      try {
        await fs.promises.rename(oldPath, newPath);
        const newUrl = `/images/${postId}/${fileName}`;
        newFileUrls.push(newUrl);
        console.log(`Moved ${oldPath} to ${newPath}`);
      } catch (renameErr) {
        console.error(`Error moving file ${oldPath}: ${renameErr}`);
        // 클라이언트에게는 원래 임시 URL 또는 에러를 반환할 수 있으므로 상황에 맞게 처리
      }
    }
    return newFileUrls; // 이동된 파일들의 새로운 URL 목록 반환
  } catch (mkdirErr) {
    console.error(`Error creating post directory ${NEW_POST_PATH}: ${mkdirErr}`);
    return [];
  }
};

// 게시글 등록
exports.createPost = async (req, res) => {
  const { title, subtitle, author, slug, content, thumbnail, category, subcategory, isPublished, tags, isPinned, tempImgPath } = req.body;
  const date = new Date();
  const now = date.getTime();

  try {
    let postId;
    const newPost = await new Promise((resolve) => {
      db.run(
        `INSERT INTO posts (created_at, updated_at, category_id, sub_category_id, author, title, sub_title, content, slug, thumbnail, is_published, is_pinned) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [now, now, category, subcategory, author, title, subtitle, content, slug, thumbnail, isPublished, isPinned],
        function (err) {
          if (err) console.log(err);
          else resolve(this.lastID)
        });
    });
    postId = newPost;

    const newImageUrls = await this.moveImagesToPostFolder(tempImgPath, postId);
    let finalContent = content;
    const newThumbnailUrl = newImageUrls[0];

    tempImgPath.forEach((oldPath, index) => {
      const oldPublicUrl = `/images/${path.relative(UPLOAD_PATH, oldPath).replace(/\\/g, '/')}`;
      finalContent = finalContent.replace(oldPublicUrl, newImageUrls[index]);
    });

    // 바뀐 content로 업데이트
    await db.run(`UPDATE posts SET content = ? thumbnail = ? WHERE id = ?`, [finalContent, newThumbnailUrl, postId]);

    // tag 등록 및 tag post 관계 설정
    const tagArray = tags.replace(/\s+/g, '').split(',');
    if (tagArray.length > 0) {
      for (let i = 0; i < tagArray.length; i++) {
        let tagId;
        const newTag = await new Promise((resolve) => {
          db.run(`INSERT INTO tags(name) VALUES('${tagArray[i]}')`,
            function (err) {
              if (err) console.log(err);
              else resolve(this.lastID)
            });
        });
        tagId = newTag;
        db.run(`INSERT INTO post_tags(post_id, tag_id) VALUES(${postId}, ${tagId})`);
      }
    }

    res.status(201).json({ success: true, message: '게시글 완전 등록 완료', postId: postId, newImageUrls: newImageUrls });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ success: false, message: '게시글 등록 실패패' });
  }



};

// 게시글 삭제시 이미지 삭제
exports.deletePostImages = async (postId) => {
  if (!postId) return;
  const postImageDir = path.join(baseUploadDir, String(postId));
  try {
    if (fs.existsSync(postImageDir)) {
      await fs.promises.rm(postImageDir, { recursive: true, force: true });
      console.log(`Deleted image directory for post ID: ${postId}`);
    }
  } catch (err) {
    console.error(`Error deleting image directory for post ID ${postId}: ${err}`);
  }
};