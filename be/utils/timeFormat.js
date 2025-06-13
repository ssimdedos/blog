function timeFormatting(time) {
  const unixTime = parseInt(time);
  const date = new Date(unixTime);
  const formattedDate = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  if (isNaN(date.getTime())) {
    console.error("Invalid Date provided to timeFormatting:", time);
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


function kstDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const kstDateString = `${year}-${month}-${day}`;
  return kstDateString;
}

function kstDateTimeString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const kstDateTimeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return kstDateTimeString;
}

module.exports = {
  timeFormatting,
  timeFormattingDetail,
  kstDateString,
  kstDateTimeString
};