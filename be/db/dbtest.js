// const sql = require('sqlite3');
// const path = require('path');
// const bcrypt = require('bcryptjs');
import sqlite3 from 'sqlite3';
import path from 'path';
import * as bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db_path = path.resolve(__dirname, 'blog.db');

const db = new sqlite3.Database(db_path, (err) => {
  if (err) console.log(err);
  else console.log('sqlite db 연결 성공');
});

// db.run('DROP TABLE posts');
// db.run('DROP TABLE tags');
// db.run('DROP TABLE subcategories');
// db.run('DROP TABLE post_tags');
// db.run('DROP TABLE visitors');

db.run(`CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT DEFAULT '0',
  category_id INTEGER NOT NULL,
  sub_category_id INTEGER DEFAULT 0,
  author TEXT DEFAULT 'idea de mis dedos',
  title TEXT NOT NULL,
  sub_title TEXT,
  content TEXT NOT NULL,
  slug TEXT NOT NULL,
  thumbnail TEXT,
  is_published INTEGER DEFAULT 1,
  is_pinned INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (sub_category_id) REFERENCES subcategories(id) ON DELETE SET DEFAULT
)`, (err) => {
  if (err) console.log(err);
});

db.run(`CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  is_published INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0
)`, (err) => {
  if (err) console.log(err);
});

db.run(`CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
)`, (err) => {
  if (err) console.log(err);
});

db.run(`CREATE TABLE IF NOT EXISTS subcategories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_id INTEGER,
  order_index INTEGER DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
)`, (err) => {
  if (err) console.log(err);
});

db.run(`CREATE TABLE IF NOT EXISTS post_tags (
  post_id INTEGER,
  tag_id INTEGER,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id)
)`, (err) => {
  if (err) console.log(err);
});

db.run(`CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  parent_comment_id INTEGER,
  author TEXT NOT NULL,
  password TEXT NOT NULL,
  content TEXT NOT NULL,
  is_private INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  deleted_at TEXT DEFAULT '0',
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE NO ACTION
)`, (err) => {
  if (err) console.log(err);
});
db.run(`CREATE TABLE IF NOT EXISTS visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_date TEXT NOT NULL UNIQUE,
    unique_visitors_count INTEGER DEFAULT 0 NOT NULL,
    today_total_page_view INTEGER DEFAULT 0 NOT NULL,
    created_at TEXT DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
    updated_at TEXT DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))
)`, (err) => {
  if (err) console.log(err);
});
db.run(`CREATE INDEX IF NOT EXISTS idx_visitors_visit_date ON visitors (visit_date)
`, (err) => {
  if (err) console.log(err);
});
db.run(`CREATE TABLE IF NOT EXISTS admin (
    id TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);
`, (err) => {
  if (err) console.log(err);
});

// const hashedPassword = await bcrypt.hash('qwertyui', parseInt(10));
// db.run(`INSERT INTO admin (id, password) VALUES ('idea de mis dedos', ?)`, [hashedPassword], 
//   (err) =>{
//     if (err) console.log(err);
//   });

// db.run(`INSERT INTO categories (name) VALUES ('삶: La vida'), ('공부: Estudio'), ('¡Aprender Coreano!'), ('기타 : etc')`, (err) => {
//   if (err) console.log(err);
// });

db.all(`SELECT * FROM categories`, (err, rows) => {
  if (err) console.log('categories못가져옴', err);
  else console.log(rows);
});

db.all(`SELECT * FROM admin`, (err, rows) => {
  if (err) console.log('admin못가져옴', err);
  else console.log(rows);
});

db.all(`SELECT * FROM clients_info`, (err, rows) => {
  if (err) console.log('clients_info못가져옴', err);
  else console.log(rows);
});

db.all(`SELECT id, view_count FROM posts WHERE view_count > 1`, (err, rows) => {
  if (err) console.log('posts', err);
  else console.log(rows);
});

