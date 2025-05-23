const e = require('express');
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

exports.getAllSubCategories = (req, res) => {
  // console.log(req.query.categoryId);
  let id = req.query.categoryId;
  let query = `SELECT * FROM subcategories`;
  if(id == undefined) id=1;
  if(id !== 'all') {
    query += ` WHERE category_id = ?`;
    db.all(query, [id], (err, rows) => {
      if (err) {
        console.log(err);
        return res.status(500).send('DB err category.get');
      } else {
        res.json(rows);
      }
    });
  } else if (id === 'all') {
    db.all(query, (err, rows) => {
      if (err) {
        console.log(err);
        return res.status(500).send('DB err category.get');
      } else {
        res.json(rows);
      }
    });

  }
}

exports.createSubCategory = (req, res) => {
  // console.log(req.body);
  const {name, category_id} = req.body;
  let query = `INSERT INTO subcategories (category_id, name) VALUES (${category_id}, '${name}')`;
  db.run(query, (err) => {
    if (err) {
      console.log(err);
      res.json(err);
    } else {
      res.json({'msg':'서브카테고리가 추가되었습니다.'});
    }
  });
}

exports.deleteSubCategory = (req, res) => {
  // console.log(req.params.id);
  let query = `DELETE FROM subcategories WHERE id='${req.params.id}'`;
  db.run(query, (err) => {
    if (err) {
      console.log(err);
      res.json(err);
    } else {
      res.json({'msg':'서브카테고리가 삭제되었습니다.'});
    }
  });
}