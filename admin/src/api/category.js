// src/api/posts.js
import axios from 'axios';

const API_BASE_URL = '/api/category'; // 백엔드 API 주소
const API_BASE_URL_SUB = '/api/subcategory'; // 백엔드 API 주소

// 카테고리 목록 가져오기
export async function fetchCategory() {
  const res = await axios.get(API_BASE_URL);
  return res.data;
}

// 카테고리 추가
export async function createCategory(postData) {
  const res = await axios.post(API_BASE_URL, postData);
  return res.data;
}
// 카테고리 삭제
export async function deleteCategory(postData) {
  const res = await axios.delete(`${API_BASE_URL}/${postData}`);
  return res.data;
}

// 카테고리명 변경
export async function editCategoryName(postData) {
  // console.log(postData);
  const res = await axios.put(`${API_BASE_URL}/${postData.id}/${postData.name}`);
  return res.data;
}

// 서브카테고리 목록 가져오기
export async function fetchSubcategory(id) {
  const res = await axios.get(API_BASE_URL_SUB, {
    params: { categoryId: id }
  });
  return res.data;
}

// 서브카테고리 생성
export async function createSubcategory(postData) {
  const res = await axios.post(API_BASE_URL_SUB, postData);
  return res.data;
}
// 서브카테고리 삭제
export async function deleteSubcategory(postData) {
  const res = await axios.delete(`${API_BASE_URL_SUB}/${postData}`);
  return res.data;
}

