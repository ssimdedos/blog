const sql = require('sqlite3').verbose();
const { SitemapStream, streamToPromise } = require('sitemap');
const fs = require('fs');
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


// sitemap 생성 함수
async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: 'https://ideademisdedos.com' });

  // DB에서 게시글 가져오기
  db.all('SELECT id, slug FROM posts', async (err, rows) => {
    if (err) {
      console.error('DB 오류:', err);
      return;
    }
    //홈 
    sitemap.write({
      url: `/`,
      changefreq: 'monthly',
      priority: 1,
    });
    //태그 
    sitemap.write({
      url: `/tag`,
      changefreq: 'monthly',
      priority: 0.7,
    });
    // 각 게시글을 sitemap에 추가
    rows.forEach(row => {
      sitemap.write({
        url: `/pages/${row.id}/${row.slug}`,
        changefreq: 'monthly',
        priority: 0.8,
      });
    });

    sitemap.end();

    // XML 파일로 저장
    const xml = await streamToPromise(sitemap);
    const sitemapPath = path.resolve(__dirname, '../../fe/public/sitemap.xml');
    fs.writeFileSync(sitemapPath, xml.toString(), 'utf8');
    console.log('✅ sitemap.xml 생성 완료!');
  });
}

generateSitemap();

module.exports = db;