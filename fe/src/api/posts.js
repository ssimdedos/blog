// src/api/posts.js
import axios from 'axios';

const API_BASE_URL = '/api/posts'; // 백엔드 API 주소

// 게시글 목록 가져오기
export async function fetchPosts(id, pageNum) {
  const res = await axios.get(API_BASE_URL, {
    params: { categoryId: id, pageNum: pageNum }
  });
  // console.log(res.data);
  if (id == 'all') {
    return res.data;
  } else {
    // console.log(res.data.data3);
    return res.data;
  }
}

// 서브카테고리 게시글 목록 가져오기
export async function fetchPostsSubcategory(id, pageNum) {
  const res = await axios.get(API_BASE_URL, {
    params: { subcategoryId: id, pageNum: pageNum }
  });
  if (id == 'all') {
    return res.data;
  } else {
    // console.log(res.data.data2);
    return res.data;
  }
}

// 태그별 게시글 목록 가져오기
export async function fetchPostsByTag(id, pageNum) {
  const res = await axios.get(`${API_BASE_URL}/tag`, {
    params: { tagId: id, pageNum: pageNum }
  });
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

// 조회수 증가
export async function increaseView(id) {
  await axios.post(`${API_BASE_URL}/${id}/increaseView`);
}

// 인기 글 목록 가져오기
export async function getHotPosts() {
  const res = await axios.get(`${API_BASE_URL}/hotPosts`);
  return res.data;
}