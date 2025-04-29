const sql = require('sqlite3').verbose();
const path = require('path');
const db_path = path.resolve(__dirname, 'blog.db');

const db = new sql.Database(db_path, (err)=> {
  if (err) console.log('DB 연결 실패', err)
  else console.log('sqlite db 연결 성공')
});


// 연결 테스트
// db.all(`SELECT name FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' UNION ALL SELECT name FROM sqlite_temp_master WHERE type IN ('table', 'view') ORDER BY 1;`, 
//   (err, rows) => {
//     if (err) console.log(err);
//     else {
//       console.log('db 연결 test', rows);;
//     }
//   }
// )

module.exports = db;