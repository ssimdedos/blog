const db = require('../db/db');
const timeUtil = require('../utils/timeFormat');

exports.userIncrement = (req, res) => {
  // 배포 후 개발
  console.log(req.headers.referer); // 직전 유입 경로
  console.log(req.ip); // ip주소대역을 통한 지역 정보 수집 가능

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
        return res.status(200).json({ success: true, msg: '방문자수 증가 완료료' });
      } else {
        // 이 경우는 거의 없겠지만, 만약을 대비
        console.warn('방문자 수 관련 행이 하나도 변경되지 않음');
        return res.status(200).json({ success: true, msg: 'Visitor count update acknowledged, but no changes reported.' });
      }
    }
  );
  return
}