const bcrypt = require('bcryptjs');
const db = require('../db/db');
const timeUtil = require('../utils/timeFormat');

exports.userIncrement = async(req, res) => {
  // console.log(req.headers.referer); // 직전 유입 경로
  // console.log(req.ip); // ip주소대역을 통한 지역 정보 수집 가능
  const ipAddr = req.ip;
  const funnels = req.headers.referer;
  try {
    await db.runAsync(`CREATE TABLE IF NOT EXISTS clients_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT NOT NULL,
      funnels TEXT NOT NULL,
      created_at TEXT DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))
      )`);
    if(funnels === '127.0.0.1') {
      return res.status(200).json({success:true, msg: '관리자 방문 건'});
    } else {
      await db.runAsync(`INSERT INTO clients_info (ip_address, funnels) VALUES (?, ?)`, [ipAddr, funnels]);
      console.log(`사용자 정보 등록 완료,${ipAddr}, ${funnels}`);
      // 'YYYY-MM-DD' 형식
      const kstDateString = timeUtil.kstDateString();
    
      // 'YYYY-MM-DD HH:MM:SS' 형식
      const kstDateTimeString = timeUtil.kstDateTimeString();
      db.run(
        `INSERT INTO visitors (visit_date, unique_visitors_count, updated_at)
             VALUES (?, 1, ?)
             ON CONFLICT(visit_date) DO UPDATE SET unique_visitors_count = unique_visitors_count + 1, updated_at = ?`,
        [kstDateString, kstDateTimeString, kstDateTimeString],
        function (err) {
          if (err) {
            console.error('방문자 증가 실패:', err.message);
            return res.status(500).json({ success: false, msg: 'Server error: Failed to increment visitor count.' });
          }
    
          if (this.changes > 0) {
            return res.status(200).json({ success: true, msg: '방문자수 증가 완료' });
          } else {
            // 이 경우는 거의 없겠지만, 만약을 대비
            console.warn('방문자 수 관련 행이 하나도 변경되지 않음');
            return res.status(200).json({ success: true, msg: 'Visitor count update acknowledged, but no changes reported.' });
          }
        }
      );
    }
  } catch (err) {
    if (err) console.log('유입경로 획득 실패, ',err);
  }

  return
}

exports.authAdmin = async(req, res) => {
  // console.log(req.body);
  const { password } = req.body;
  const row = await db.getAsync(`SELECT password FROM admin`);
  const isMatch = await bcrypt.compare(password, row.password);
  // console.log(isMatch);
  if (isMatch) {
    res.status(200).json({ success: true, msg: '비밀번호 확인 완료.' });
  } else {
    res.status(200).json({ success: false, msg: '비밀번호가 틀렸습니다.' });
  }
}