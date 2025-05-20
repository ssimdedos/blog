const db = require('../db/db');

exports.getAllPosts = (req, res) => {
  // console.log(req.query.categoryId);
  const id = req.query.categoryId;
  let query = 'SELECT * FROM posts';
  let query2 = 'SELECT name FROM categories';

  if(id!='all') {
    // console.log('카테고리 들어옴');
    query = query+` WHERE category_id=${id}`;
    query2 = query2+` WHERE id=${id}`;
    // console.log(query);
  } else {
    // console.log('all들어옴');
  }
  db.all(query, (err, rows1) => {
    if (err) {
      console.log(err);
      return res.status(500).send('DB err post.get');
    } else {
      if(id!='all') {
        db.all(query2, (err, rows2) => {
          if (err) {
            console.log(err);
            return res.status(500).send('DB err categories.get name');
          } else {
            // console.log(rows2);
            res.json({data1: rows1, data2: rows2});  
          }
        });
      } else {
        res.json(rows1);
      }
    }
  });
}