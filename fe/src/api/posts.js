// src/api/posts.js
import axios from 'axios';

const API_BASE_URL = '/api/posts'; // 백엔드 API 주소

// 게시글 목록 가져오기
export async function fetchPosts(id) {
  const res = await axios.get(API_BASE_URL, {
    params: { categoryId: id }
  });
  console.log(res.data);
  return res.data;
}

// 게시글 하나 가져오기
export async function fetchPost(id) {
  const res = await axios.get(`${API_BASE_URL}/${id}`);
  return res.data;
}

// 게시글 생성
export async function createPost(postData) {
  const res = await axios.post(API_BASE_URL, postData);
  return res.data;
}

// 게시글 수정
export async function updatePost(id, postData) {
  const res = await axios.put(`${API_BASE_URL}/${id}`, postData);
  return res.data;
}

// 게시글 삭제
export async function deletePost(id) {
  const res = await axios.delete(`${API_BASE_URL}/${id}`);
  return res.data;
}