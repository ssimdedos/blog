const db = require('../db/db');
const timeUtil = require('../utils/timeFormat');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const path = require('path');

const SALT_ROUND = process.env.SALT_ROUND;

exports.addComment = async (req, res) => {
  const date = new Date();
  const now = date.getTime();
  // console.log(req.body);
  const { postId, commentInfo } = req.body;
  const query = `INSERT INTO comments(post_id, parent_comment_id, author, password, content, created_at, updated_at) VALUES(?, ?, ?, ?, ?, ?, ?)`;
  // console.log(commentInfo.password);
  const hashedPassword = await bcrypt.hash(commentInfo.password, parseInt(SALT_ROUND));
  // console.log(hashedPassword);
  let queryData = [postId, commentInfo.parent_comment_id ? commentInfo.parent_comment_id : null, commentInfo.author, hashedPassword, commentInfo.content, now, now];
  db.run(query, queryData, (err) => {
    if (err) {
      console.log('댓글 등록 실패, ', err);
      res.status(500).json({ success: false, msg: '댓글 등록이 실패했습니다.'});
    } else {
      db.get(`SELECT LAST_INSERT_ROWID() id`, (err, row) => {
        if (err) {
          console.log('댓글 아이디 받아오기 실패, ', err);
        } else {
          formattedDate = timeUtil.timeFormattingDetail(now);
          const newComment = {
            author: commentInfo.author,
            created_at: formattedDate,
            deleted_at: '0',
            content: commentInfo.content,
            parent_comment_id: commentInfo.parent_comment_id ? commentInfo.parent_comment_id : null,
            id: row.id,
            postId: postId
          };
          res.status(201).json({ success: true, msg: '댓글 등록이 완료되었습니다.', newComment });
        }
      });
    }
  });
}

exports.deleteComment = (req, res) => {
  const {commentId, password} = req.body;
  const date = new Date();
  const now = date.getTime();
  const query = `UPDATE comments SET deleted_at = ? WHERE id = ?`;
  const query2 = `SELECT password FROM comments WHERE id = ?`;
  db.get(query2, [commentId], async (err, row) => {
    if (err) console.error('비밀번호 가져오기 에러, ', err);
    else {
      const isMatch = await bcrypt.compare(password, row.password);
      if (isMatch) {
        db.run(query, [now, commentId], (err) => {
          if (err) console.error('댓글 삭제 에러, ', err);
          else res.status(200).json({ success: true, msg: '댓글이 삭제되었습니다.'});
        });
      } else  res.json({ success: false, msg: '비밀번호가 틀렸습니다.'});
    }
  })
}