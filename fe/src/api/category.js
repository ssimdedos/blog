// src/api/posts.js
import axios from 'axios';

const API_BASE_URL = '/api/category'; // 백엔드 API 주소

// 카테고리 목록 가져오기
export async function fetchCategory() {
  const res = await axios.get(API_BASE_URL);
  return res.data;
}