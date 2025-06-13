function timeFormatting(time) {
  const unixTime = parseInt(time);
  const date = new Date(unixTime);
  const formattedDate = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  if (isNaN(date.getTime())) {
    console.error("Invalid Date provided to timeFormattingDetail:", time);
    return "날짜 오류"; // 또는 다른 기본값
  }
  return formattedDate
}

function timeFormattingDetail(time) {
  const unixTime = parseInt(time);
  const date = new Date(unixTime);
  const formattedDate = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  if (isNaN(date.getTime())) {
    console.error("Invalid Date provided to timeFormattingDetail:", time);
    return "날짜 오류"; // 또는 다른 기본값
  }
  return formattedDate
}

module.exports = {
  timeFormatting,
  timeFormattingDetail
};