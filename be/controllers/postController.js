const db = require('../db/db');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const striptags = require('striptags');
const timeUtil = require('../utils/timeFormat');

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
      let postCnt;
      let totalPages;
      db.get(query3, (err, row2) => {
        if (row2 !== undefined) {
          postCnt = row2['COUNT(*)'];
          totalPages = Math.ceil(postCnt / limit);
        } else postCnt = 0;
        const stripedPosts = rows1.map(row => {
          return ({
            ...row,
            summary: striptags(row.content).substring(0, 150),
            created_at: timeUtil.timeFormatting(row.created_at)
          });
        });
        if (id != 'all') {
          db.all(query2, (err, rows3) => {
            if (err) {
              console.log(err);
              return res.status(500).send('DB err categories.get name');
            } else {
              res.json({ data1: stripedPosts, data2: rows3, postCnt: postCnt, totalPages: totalPages });
            }
          });
        } else {
          // console.log(stripedPosts);
          res.json({ stripedPosts, postCnt, totalPages });
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
        return {
          ...post,
          created_at: timeUtil.timeFormatting(post.created_at)
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
          console.log(`임시 이미지 폴더 삭제: ${todayUploadDir}`);
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

async function getOrCreateTagId(tagName) {
  try {
    // 태그 삽입 시도 또는 무시 (IGNORE)
    const insertSql = `INSERT OR IGNORE INTO tags(name) VALUES(?)`;
    console.log(`[getOrCreateTagId] 쿼리 실행: '${insertSql}' 파라미터: '${tagName}'`);
    const insertResult = await db.runAsync(insertSql, tagName);

    if (insertResult.lastID && insertResult.changes === 1) {
      console.log(`[getOrCreateTagId] 동작: 새 태그 삽입됨. 반환할 ID: ${insertResult.lastID}`);
      return insertResult.lastID;
    }
    else if (insertResult.changes === 0) {
      console.log(`[getOrCreateTagId] 동작: 태그가 이미 존재 (또는 삽입 무시). ID 조회 시도.`);
      const selectSql = `SELECT id FROM tags WHERE name = ?`;
      const existingTag = await db.getAsync(selectSql, [tagName]);
      // 기존 태그를 찾음
      if (existingTag && existingTag.id) {
        console.log(`[getOrCreateTagId] 동작: 기존 ID 반환 for '${tagName}': ${existingTag.id}`);
        return existingTag.id;
      } else {
        // 혼란의 카오스
        console.error(`[getOrCreateTagId] 치명적 오류: 태그 '${tagName}'이(가) 무시되었는데 SELECT로 찾을 수 없습니다. DB 불일치 확인 필요!`);
        throw new Error(`Tag '${tagName}' ignored but not found by SELECT, check DB state.`);
      }
    }
  } catch (error) {
    console.error(`[getOrCreateTagId] 태그 '${tagName}' 처리 중 오류 발생:`, error);
    throw error; // 상위 try/catch 블록으로 오류 다시 던짐
  } finally {
    console.log(`--- [getOrCreateTagId] 끝: 태그 '${tagName}' 처리 완료 ---`);
  }
}

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
        [now, now, category, subcategory ? subcategory : 0, author, title, subtitle, content, slug, thumbnail, isPublished, isPinned],
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
      // console.log(newThumbnailUrl);
    } else {
      newThumbnailUrl = newImageUrls[0];
    }

    tempImgPath.forEach((oldPath, index) => {
      const oldPublicUrl = `/images/${path.relative(UPLOAD_PATH, oldPath).replace(/\\/g, '/')}`;
      finalContent = finalContent.replace(oldPublicUrl, newImageUrls[index]);
    });

    // 바뀐 content로 업데이트
    db.run(`UPDATE posts SET content = ?, thumbnail = ? WHERE id = ?`, [finalContent, newThumbnailUrl, postId]);

    // tag 등록 및 tag post 관계 설정
    // const tagArray = tags.replace(/\s+/g, '').split(',');
    const tagArray = tags.split(/[,\s]+/).filter(tag => tag.length > 0).map(tag => tag.trim());
    if (tagArray.length > 0) {
      for (const tagName of tagArray) {
        try {
          // const tagInsertRes = await db.runAsync(`INSERT OR IGNORE INTO tags(name) VALUES(?)`, [tagName]);
          // const tagId = tagInsertRes.lastID;
          const tagId = await getOrCreateTagId(tagName);
          console.log(`게시글 ${postId}와 태그 '${tagName}' 태그 등록 완료.`);
          await db.runAsync(`INSERT OR IGNORE INTO post_tags(post_id, tag_id) VALUES(${postId}, ${tagId})`);
          console.log(`게시글 ${postId}와 태그 '${tagName}' (ID: ${tagId}) 연결 성공.`);
        } catch (err) {
          console.log('태그 등록 중 에러', err);
        }
      }
    }
    console.log(`게시글 등록 완료 postID: ${postId}, tags: ${tagArray}`);
    res.status(201).json({ success: true, message: '게시글 등록 완료', postId: postId, newImageUrls: newImageUrls });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ success: false, message: '게시글 등록 실패' });
  }
};

// 게시글 하나 불러오기
exports.getPost = async (req, res) => {
  const postId = req.params.id;
  // 게시글 관련 쿼리
  const query = `SELECT * FROM posts WHERE id = ?`;
  const query2 = `
  SELECT t.id id, t.name name, (SELECT COUNT(pt.post_id) FROM post_tags pt WHERE pt.tag_id = t.id) postCnt
  FROM tags t 
  JOIN post_tags pt ON t.id = pt.tag_id 
  WHERE pt.post_id = ?`;
  const query3 = `SELECT id, title, slug, thumbnail FROM posts WHERE id < ? AND is_published = 1 AND deleted_at = 0 ORDER BY id DESC LIMIT 1`;
  const query4 = `SELECT id, title, slug, thumbnail FROM posts WHERE id > ? AND is_published = 1 AND deleted_at = 0 ORDER BY id LIMIT 1`;

  // 댓글 관련 쿼리
  const queryForComment = `SELECT id, post_id, author, content, parent_comment_id, created_at, deleted_at FROM comments WHERE post_id = ?`;
  try {
    const postInfo = await db.getAsync(query, [postId]);
    const tagArray = await db.allAsync(query2, [postId]);
    const formerPost = await db.getAsync(query3, [postId]);
    const nextPost = await db.getAsync(query4, [postId]);
    const commentArray = await db.allAsync(queryForComment, [postId]);
    const modifiedPosts = {...postInfo, created_at: timeUtil.timeFormatting(postInfo['created_at'])};
    const modifiedComments = commentArray.map((cmt) => ({
      ...cmt,
      created_at: timeUtil.timeFormattingDetail(cmt.created_at)
    }));
    const data = { post: modifiedPosts, tags: tagArray, formerPost, nextPost, comments: modifiedComments }
    res.json({ success: true, msg:'게시글 정보 및 관련 정보 가져오기 완료', data });
  } catch (err) {
    console.error('게시글 못가져옴', err);
    res.status(500).json({ success: false, message: '게시글 불러오기 실패' })
  }
}

exports.updatePost = async (req, res) => {
  const date = new Date();
  const now = date.getTime();
  const updateKeys = Object.keys(req.body);
  let updateData = [];
  const { tags, deletedTags, tempImgPath, content, thumbnail } = req.body;
  const { id } = req.params;
  // console.log(req.body);
  // console.log(thumbnail);
  let query = `UPDATE posts SET `;
  updateKeys.map((e, i) => {
    if (e !== 'tags' && e !== 'tempImgPath' && e !== 'deletedTags') {
      query = query + `${e} = ?, `;
      updateData.push(req.body[e]);
    }
  });
  query = query + ` updated_at = ?`;
  // query = query.slice(0, -2);
  query = query + ` WHERE id = ?`;
  updateData.push(now);
  updateData.push(id);
  // console.log(updateData);
  db.run(query, updateData, async (err) => {
    if (err) {
      console.error('게시글 업데이트 실패', err);
      res.status(500).json({ success: false, msg: '게시글 업데이트 실패' });
    }
    else {
      console.log(tempImgPath);
      // let newThumbnailUrl = `${BASE_URL}/images/${path.join('logo', 'logo192.png').replace(/\\/g, '/')}`;
      let newThumbnailUrl = thumbnail ? thumbnail : `${BASE_URL}/images/${path.join('logo', 'logo192.png').replace(/\\/g, '/')}`;
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
      if(deletedTags) {
        deletedTags.map((tag) => {
          db.run(`DELETE FROM post_tags WHERE post_id = ? AND tag_id = (SELECT id FROM tags WHERE name = ? )`, [id, tag]);
        });
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

// 게시글 삭제시 이미지 삭제
exports.deletePostImages = async (postId) => {
  if (!postId) return;
  const postImageDir = path.join(UPLOAD_PATH, String(postId));
  try {
    if (fs.existsSync(postImageDir)) {
      await fs.promises.rm(postImageDir, { recursive: true, force: true });
      console.log(`게시글이 삭제되어 등록된 이미지 폴더도 삭제합니다.: ${postId}`);
    }
  } catch (err) {
    console.error(`삭제 에러 게시글 ID ${postId}: ${err}`);
  }
};


exports.deletePost = async (req, res) => {
  const date = new Date();
  const now = date.getTime();
  const { id } = req.params;
  db.run(`UPDATE posts SET deleted_at = ? WHERE id = ?`, [now, id],
    (err, result) => {
      if (err) {
        console.log('게시글 삭제처리 실패, ', err);
        res.status(500).json({ success: false, msg: `게시글 삭제 실패: ${err}` });
      }
      else {
        res.status(200).json({ success: true, msg: '게시글 삭제 완료' });
      }
    });
}

exports.increaseView = async (req, res) => {
  const { id } = req.params;
  const kstDateString = timeUtil.kstDateString();
  try {
    db.run(`UPDATE posts SET view_count = view_count + 1 WHERE id = ?`, [id], (err) => {
      if (err) console.error('게시글 조회수 증가 실패, ', err);
      else {
        db.run(`INSERT INTO visitors (visit_date, unique_visitors_count, today_total_page_view)
          VALUES (?, 0, 1)
          ON CONFLICT(visit_date) DO UPDATE SET
          today_total_page_view = today_total_page_view + 1
          `,
          [kstDateString], (err) => {
            if (err) console.error('게시글 조회수 증가 실패, ', err);
            else res.status(200).json({ success: true, msg: '조회수 증가 완료' });
          });

      }
    });

  } catch (err) {
    console.error('조회수 증가 처리 중 에러 발생:', err.message);
    res.status(500).json({ success: false, msg: 'Server error: Failed to increase view count.', error: err.message });
  }
}

exports.getPostByTag = async (req, res) => {
  try {
    const { tagId, pageNum } = req.query;
    // console.log(tagId, pageNum);
    const limit = 9;
    const query = `
    SELECT p.id id, p.thumbnail thumbnail, p.title title, p.sub_title sub_title, p.content content, p.created_at created_at, p.category_id category_id, p.slug slug 
    FROM posts p JOIN post_tags pt ON p.id = pt.post_id
    WHERE p.is_published = 1 AND p.deleted_at = '0' AND pt.tag_id = ?
    ORDER BY CAST(p.created_at as INTEGER) DESC
    LIMIT ${limit} OFFSET ${pageNum > 1 ? (pageNum - 1) * limit - 1 : 0}
    `;
    const query2 = `
    SELECT COUNT(p.id) postCnt FROM posts p 
    JOIN post_tags pt ON p.id = pt.post_id
    WHERE p.is_published = 1 AND p.deleted_at = '0' AND pt.tag_id = ?
    `;
    const postArray = await db.allAsync(query, [tagId]);
    const modifiedPosts = postArray.map(row => {
      return ({
        ...row,
        summary: striptags(row.content).substring(0, 150),
        created_at: timeUtil.timeFormatting(row.created_at)
      });
    });
    const postCntRes = await db.getAsync(query2, [tagId]);
    const postCnt = postCntRes.postCnt;
    const totalPages = Math.ceil(postCnt / limit);
    const data = { modifiedPosts, postCnt, totalPages };
    // console.log(postArray);
    res.status(200).json({ success: true, msg: '태그별 게시글 목록 가져오기 성공', data });
  } catch (err) {
    console.error('조회수 증가 처리 중 에러 발생:', err.message);
    res.status(500).json({ success: false, msg: '태그별 게시글 목록 가져오기 실패', error: err.message });
  }
}