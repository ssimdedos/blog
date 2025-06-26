const sql = require('sqlite3').verbose();
const path = require('path');
const db_path = path.resolve(__dirname, 'blog.db');
const util = require('util');

const db = new sql.Database(db_path, (err)=> {
  if (err) console.log('DB 연결 실패', err)
  else console.log('sqlite db 연결 성공')
});

db.getAsync = util.promisify(db.get);
// db.runAsync = util.promisify(db.run);
db.allAsync = util.promisify(db.all);
db.runAsync = function(sql, ...params) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) { // 'this' 컨텍스트 유지를 위해 일반 함수 사용
            if (err) {
                return reject(err);
            }
            // 성공 시, this 객체의 lastID와 changes를 포함하는 객체를 resolve
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

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