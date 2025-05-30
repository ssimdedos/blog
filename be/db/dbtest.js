const sql = require('sqlite3');
const path = require('path');

const db_path = path.resolve(__dirname, 'blog.db');

const db = new sql.Database(db_path, (err) => {
  if (err) console.log(err);
  else console.log('sqlite db 연결 성공');
});

// db.run('DROP TABLE posts');
// db.run('DROP TABLE tags');
// db.run('DROP TABLE subcategories');
// db.run('DROP TABLE pots_tags');

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
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (sub_category_id) REFERENCES subcategories(id)
)`, (err) => {
  if (err) console.log(err);
});

db.run(`CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
)`, (err) => {
  if (err) console.log(err);
});

db.run(`CREATE TABLE IF NOT EXISTS post_tags (
  post_id INTEGER,
  tag_id INTEGER,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
)`, (err) => {
  if (err) console.log(err);
});

db.run(`CREATE TABLE IF NOT EXISTS subcategories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_id INTEGER,
  FOREIGN KEY (category_id) REFERENCES categories(id)
)`, (err) => {
  if (err) console.log(err);
});



db.all(`SELECT * FROM posts`, (err, rows) => {
  if (err) console.log('post못가져옴', err);
  else console.log(rows);
});

db.all(`SELECT * FROM tags`, (err, rows) => {
  if (err) console.log('post못가져옴', err);
  else console.log(rows);
});