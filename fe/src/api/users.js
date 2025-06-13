import axios from 'axios';

const API_BASE_URL = '/api/user'; // 백엔드 API 주소

export async function recordUserInfo () {
  const res = await axios.post(`${API_BASE_URL}/increment`);
  return res.data;
}
