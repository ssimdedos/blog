const db = require('../db/db');

exports.getAllCategories = (req, res) => {
  // console.log(req.body);
  db.all(`SELECT * FROM categories`, (err, rows) => {
    if (err) {
      console.log(err);
      return res.status(500).send('DB err category.get');
    } else {
      // rows.forEach(e => {
      //   console.log(e);
      // });
      res.json(rows);
    }
  });
}