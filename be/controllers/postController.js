const db = require('../db/db');

exports.getAllPosts = (req, res) => {
  // console.log(req.body);
  db.all(`SELECT * FROM posts`, (err, rows) => {
    if (err) {
      console.log(err);
      return res.status(500).send('DB err post.get');
    } else {
      rows.forEach(e => {
        console.log(e);
      });
      res.json(rows);
    }
  });
  // res.send('모든 글 목록 반환');
}