const db = require('../db/db');

// 한글 초성을 추출하는 유틸리티 함수
const getInitialConsonant = (char) => {
  const ga = 44032; // '가'의 유니코드
  const kiyeok = 12593; // 'ㄱ'의 유니코드 (초성 시작)

  const initialConsonants = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];

  if (char.charCodeAt(0) < ga || char.charCodeAt(0) > 55203) { // 55203은 '힣'의 유니코드
    // 한글이 아니면 해당 문자 그대로 반환 (숫자, 영어 등)
    const code = char.charCodeAt(0);
    if (code >= 48 && code <= 57) return '숫자'; // 숫자
    if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) return char.toUpperCase().charAt(0); // 영문 첫 글자 (대문자로)
    return '기타'; // 그 외 특수 문자 등
  }

  const index = Math.floor((char.charCodeAt(0) - ga) / 588); // 588 = 21 * 28 (중성 * 종성 개수)
  return initialConsonants[index];
};

exports.getAllTags = async (req, res) => {
  try {
    const tags = await db.allAsync(`
      SELECT t.id id, t.name name, COUNT(pt.post_id) postCnt 
      FROM tags t 
      JOIN post_tags pt ON t.id = pt.tag_id 
      GROUP BY t.id, t.name
      ORDER BY t.name ASC`);

    // 초성별로 태그를 그룹화
    const groupedTags = tags.reduce((acc, tag) => {
      const initial = getInitialConsonant(tag.name.charAt(0)); // 태그 이름의 첫 글자로 초성 추출
      if (!acc[initial]) {
        acc[initial] = [];
      }
      acc[initial].push(tag);
      return acc;
    }, {});

    // 초성 키들을 정렬 (ㄱㄴㄷ순, 영문 대문자, 숫자, 기타 순)
    const sortedInitialKeys = Object.keys(groupedTags).sort((a, b) => {
      const customOrder = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        '숫자', '기타'];
      const indexA = customOrder.indexOf(a);
      const indexB = customOrder.indexOf(b);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // 목록에 없는 경우를 위한 폴백 (예: 영문 소문자 등)
      return a.localeCompare(b);
    });

    const finalGroupedTags = sortedInitialKeys.map(key => ({
      initial: key,
      tags: groupedTags[key]
    }));

    res.json({ success: true, msg: '태그 불러오기 완료', tags: finalGroupedTags });
  } catch (err) {
    console.error('태그 목록 불러오기 실패:', err.message);
    res.status(500).json({ success: false, msg: 'Server error: Failed to load tags.' });

  }
}