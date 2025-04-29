const db = require('../db/db');

exports.getAllPosts = (req, res) => {
  // console.log(req.query.categoryId);
  const id = req.query.categoryId;
  let query = 'SELECT * FROM posts';

  if(id!='all') {
    console.log('카테고리 들어옴');
    query = query+` WHERE category_id=${id}`;
    console.log(query);
  } else {
    console.log('all들어옴');
  }
  db.all(query, (err, rows) => {
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