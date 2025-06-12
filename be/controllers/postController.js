const db = require('../db/db');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const striptags = require('striptags');


const UPLOAD_PATH = path.join(__dirname, '../', process.env.UPLOAD_PATH);
const BASE_URL = process.env.BASE_URL;
const date = new Date();
const date2 = String(date.getFullYear()) + '_' + (date.getMonth() + 1).toString().padStart(2, '0') + '_' + date.getDate().toString().padStart(2, '0');
const todayUploadDir = path.join(UPLOAD_PATH, date2);
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
  const { pageNum } = req.query;
  let id;
  const limit = 9;
  if (req.query.categoryId) {
    id = req.query.categoryId;
  } else if (req.query.subcategoryId) {
    id = req.query.subcategoryId;
  }
  let query = `SELECT id, thumbnail, title, sub_title, content, created_at, category_id, slug FROM posts WHERE is_published = 1 AND deleted_at = '0'`;
  let query2 = 'SELECT name FROM';
  let query3 = `SELECT COUNT(*) FROM posts`;

  if (id != 'all') {
    if (req.query.categoryId) {
      query = query + ` AND category_id=${id} ORDER BY CAST(created_at as INTEGER) DESC`;
      query2 = query2 + ` categories WHERE id=${id}`;
      query3 = query3 + ` WHERE category_id=${id} AND is_published = 1 AND deleted_at = 0`;
    } else if (req.query.subcategoryId) {
      query = query + ` AND sub_category_id=${id} ORDER BY CAST(created_at as INTEGER) DESC`;
      query2 = query2 + ` subcategories WHERE id=${id}`;
      query3 = query3 + ` WHERE sub_category_id=${id} AND is_published = 1 AND deleted_at = 0`;
    }
  } else {
    query = query + ` ORDER BY CAST(created_at as INTEGER) DESC`;
    query3 = query3 + ` WHERE is_published = 1 AND deleted_at = 0`;
    // console.log('all들어옴');
  }
  if (pageNum) {
    query = query + ` LIMIT ${limit} OFFSET ${pageNum > 1 ? (pageNum - 1) * limit - 1 : 0}`
    // query = query + ` LIMIT ${9} OFFSET 0`;
  }
  db.all(query, (err, rows1) => {
    if (err) {
      console.log(err);
      return res.status(500).send('DB err post.get');
    } else {
      // console.log(rows1);
      let postCtn;
      let totalPages;
      db.get(query3, (err, row2) => {
        if (row2 !== undefined) {
          postCtn = row2['COUNT(*)'];
          totalPages = Math.ceil(postCtn / limit);
        } else postCtn = 0;
        const stripedPosts = rows1.map(row => {
          const unixTime = parseInt(row.created_at);
          const date = new Date(unixTime);
          const formattedDateKR = date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
          });
          return ({
            ...row,
            summary: striptags(row.content).substring(0, 150),
            created_at: formattedDateKR
          });
        });
        if (id != 'all') {
          db.all(query2, (err, rows3) => {
            if (err) {
              console.log(err);
              return res.status(500).send('DB err categories.get name');
            } else {
              res.json({ data1: stripedPosts, data2: rows3, postCtn: postCtn, totalPages: totalPages });
            }
          });
        } else {
          // console.log(stripedPosts);
          res.json({ stripedPosts, postCtn, totalPages });
        }
      });
    }
  });
}

exports.getAllPostsAdmin = (req, res) => {
  // console.log(req.query);
  const filters = req.query;
  // console.log(filters);

  const page = parseInt(filters.page) || 1; // 기본 1페이지
  const limit = parseInt(filters.limit) || 10; // 기본 10개씩 (문제에서 10개씩 끊어온다고 함)
  const offset = (page - 1) * limit;

  // 쿼리 빌더 초기화
  let baseQuery = `
    SELECT id, created_at, category_id, sub_category_id, author, title, is_published, is_pinned
    FROM posts
    WHERE deleted_at = '0'
  `;
  let countQuery = `
    SELECT COUNT(*) AS count FROM posts WHERE deleted_at = '0'
  `;
  const queryParams = []; // SQL 파라미터 바인딩용 배열

  // 필터 조건 추가
  if (filters.startDate) {
    baseQuery += ` AND created_at >= ?`;
    countQuery += ` AND created_at >= ?`;
    queryParams.push(new Date(`${filters.startDate}T00:00:00.000Z`).getTime());
  }
  if (filters.endDate) {
    baseQuery += ` AND created_at <= ?`;
    countQuery += ` AND created_at <= ?`;
    queryParams.push(new Date(`${filters.endDate}T23:59:59.999Z`).getTime());
  }
  if (filters.categoryId && filters.categoryId !== 'all') {
    baseQuery += ` AND category_id = ?`;
    countQuery += ` AND category_id = ?`;
    queryParams.push(parseInt(filters.categoryId));
  }
  if (filters.author && filters.author !== 'all') {
    baseQuery += ` AND author = ?`;
    countQuery += ` AND author = ?`;
    queryParams.push(filters.author);
  }
  if (filters.isPublished && filters.isPublished !== 'all') {
    baseQuery += ` AND is_published = ?`;
    countQuery += ` AND is_published = ?`;
    queryParams.push(parseInt(filters.isPublished));
  }

  // 정렬 순서 (관리자 페이지에서는 ID 내림차순이 일반적)
  baseQuery += ` ORDER BY id DESC`;

  // 게시글 조회용 파라미터 (LIMIT, OFFSET 포함)
  const postsQueryParams = [...queryParams, limit, offset];

  // 총 게시글 수 조회용 파라미터 (LIMIT, OFFSET 제외)
  const countQueryParams = [...queryParams];
  // 1. 게시글 데이터 조회
  db.all(baseQuery + ` LIMIT ? OFFSET ?`, postsQueryParams, (err, posts) => {
    if (err) {
      console.error('Error fetching posts in getAllPostsAdmin:', err);
      return res.status(500).json({ success: false, message: '게시글 목록을 불러오는 데 실패했습니다.' });
    }
    // 2. 총 게시글 수 조회
    db.get(countQuery, countQueryParams, (err, totalPostsResult) => {
      if (err) {
        console.error('Error fetching total posts count:', err);
        return res.status(500).json({ success: false, message: '총 게시글 수를 불러오는 데 실패했습니다.' });
      }

      const totalPosts = totalPostsResult.count;
      const totalPages = Math.ceil(totalPosts / limit);



      // 4. 게시글 데이터 가공
      const processedPosts = posts.map(post => {
        // const formattedDate = post.created_at; // 이미 포맷된 경우
        const unixTime = parseInt(post.created_at);
        const formattedDate = new Date(unixTime).toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' }); // ISO 8601 -> YYYY. M. D.


        return {
          ...post,
          created_at: formattedDate
        };
      });

      // 5. 최종 응답 전송
      res.status(200).json({
        success: true,
        posts: processedPosts,
        currentPage: page,
        limit: limit,
        totalPosts: totalPosts,
        totalPages: totalPages,
      });
    }); // db.get (countQuery) 콜백 끝
  }); // db.all (baseQuery) 콜백 끝
};


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
      }
      try {
        if (fs.existsSync(todayUploadDir)) {
          await fs.promises.rm(todayUploadDir, { recursive: true, force: true });
          console.log(`임시 이미지 폴더 삭제제: ${todayUploadDir}`);
        }
      } catch (err) {
        console.error(`Error deleting image directory for post ID ${postId}: ${err}`);
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
    let newThumbnailUrl;
    if (newImageUrls[0] == undefined) {
      // newThumbnailUrl = path.join(`${BASE_URL}/images/${path.relative(UPLOAD_PATH,'logo','logo192.png').replace(/\\/g, '/')}`);
      newThumbnailUrl = `${BASE_URL}/images/${path.join('logo', 'logo192.png').replace(/\\/g, '/')}`;
      console.log(newThumbnailUrl);
    } else {
      newThumbnailUrl = newImageUrls[0];
    }

    tempImgPath.forEach((oldPath, index) => {
      const oldPublicUrl = `/images/${path.relative(UPLOAD_PATH, oldPath).replace(/\\/g, '/')}`;
      finalContent = finalContent.replace(oldPublicUrl, newImageUrls[index]);
    });

    // 바뀐 content로 업데이트
    await db.run(`UPDATE posts SET content = ?, thumbnail = ? WHERE id = ?`, [finalContent, newThumbnailUrl, postId]);

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
    res.status(500).json({ success: false, message: '게시글 등록 실패' });
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

// 게시글 하나 불러오기
exports.getPost = async (req, res) => {
  const postId = req.params.id;
  const query = `SELECT * FROM posts WHERE id = ?`;
  const query2 = `SELECT t.id, t.name FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ?`;
  const query3 = `SELECT id, title, slug, thumbnail FROM posts WHERE id < ? AND is_published = 1 AND deleted_at = 0 ORDER BY id DESC LIMIT 1`;
  const query4 = `SELECT id, title, slug, thumbnail FROM posts WHERE id > ? AND is_published = 1 AND deleted_at = 0 ORDER BY id LIMIT 1`;

  try {
    db.get(query, postId, (err, row) => {
      if (err) console.error('DB에서 게시글 못 불러옴: ', err)
      else {
        const unixTime = parseInt(row.created_at);
        const date = new Date(unixTime);
        const formattedDateKR = date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric'
        });
        row['created_at'] = formattedDateKR;
        db.all(query2, [postId], (err, rows) => {
          if (err) console.error(`게시글 Tag 불러오기 err, `, err);
          // console.log(rows);
          db.get(query3, [postId], (err, row2) => {
            db.get(query4, [postId], (err, row3) => {
              res.json({ post: row, tags: rows, formerPost: row2, nextPost: row3 });
            });
          });
        });
      }
    });
  } catch (err) {
    console.error('게시글 못가져옴', err);
    res.status(500).json({ success: false, message: '게시글 불러오기 실패' })
  }

}

exports.updatePost = async (req, res) => {
  const updateKeys = Object.keys(req.body);
  let updateData = [];
  const { tags, tempImgPath, content } = req.body;
  const { id } = req.params;
  // console.log(req.body);
  let query = `UPDATE posts SET `;
  updateKeys.map((e, i) => {
    if (e !== 'tags' && e !== 'tempImgPath') {
      query = query + `${e} = ?, `;
      updateData.push(req.body[e]);
    }
  });
  query = query.slice(0, -2);
  query = query + ` WHERE id = ?`;
  updateData.push(id);
  // console.log(updateData);
  db.run(query, updateData, async (err) => {
    if (err) {
      console.error('게시글 업데이트 실패', err);
      res.status(500).json({ success: false, msg: '게시글 업데이트 실패' });
    }
    else {
      console.log(tempImgPath);
      let newThumbnailUrl = `${BASE_URL}/images/${path.join('logo', 'logo192.png').replace(/\\/g, '/')}`;
      if (tempImgPath !== undefined && tempImgPath.length) {
        const newImageUrls = await this.moveImagesToPostFolder(tempImgPath, id);
        // console.log(newImageUrls);
        let finalContent = content;
        if (newImageUrls[0] !== undefined) {
          newThumbnailUrl = newImageUrls[0];
        }
        tempImgPath.forEach((oldPath, index) => {
          const oldPublicUrl = `/images/${path.relative(UPLOAD_PATH, oldPath).replace(/\\/g, '/')}`;
          finalContent = finalContent.replace(oldPublicUrl, newImageUrls[index]);
        });
        // 바뀐 content로 업데이트
        db.run(`UPDATE posts SET content = ?, thumbnail = ? WHERE id = ?`, [finalContent, newThumbnailUrl, id]);
      } else {
        // 썸네일이 있다가 사라진 경우도 있어서
        db.run(`UPDATE posts SET thumbnail = ? WHERE id = ?`, [newThumbnailUrl, id]);
      }
      if (tags !== undefined && tags.length) {
        // tag 등록 및 tag post 관계 설정
        const tagArray = tags.replace(/\s+/g, '').split(',');
        if (tagArray.length > 0) {
          for (let i = 0; i < tagArray.length; i++) {
            let tagId;
            const newTag = await new Promise((resolve) => {
              db.run(`INSERT OR IGNORE INTO tags(name) VALUES('${tagArray[i]}')`,
                function (err) {
                  if (err) console.log(err);
                  else resolve(this.lastID)
                });
            });
            tagId = newTag;
            db.run(`INSERT OR IGNORE INTO post_tags(post_id, tag_id) VALUES(${id}, ${tagId})`);
          }
        }
      }
      res.status(200).json({ success: true, msg: '게시글 업데이트 완료' })
    };
  });

}

exports.getPostForUpdate = (req, res) => {
  const { id } = req.params;
  const query = `SELECT title, sub_title, author, slug, content, category_id, sub_category_id, is_published, is_pinned FROM posts Where id = ?`;
  const query2 = `SELECT t.name FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ?`;
  try {
    db.get(query, [parseInt(id)], (err, row) => {
      if (err) {
        console.error('게시글 가져오기 실패', err);
        res.status(500).json({ success: false, msg: '게시글 가져오기 실패' });
      }
      else {
        db.all(query2, [id], (err, tags) => {
          if (err) {
            console.error('태그 가져오기 실패', err);
            res.status(500).json({ success: false, msg: '태그 가져오기 실패' });
          } else {
            let tagArray = [];
            tags.map((tag) => {
              // console.log(tag.name);
              tagArray.push(tag.name);
            });
            const data = { ...row, 'tags': tagArray };
            // console.log(data);
            res.json(data);
          }
        });
      }
    });
  } catch {
  } finally {
    // res.json({msg: '게시글 가져오기'});
  }
}