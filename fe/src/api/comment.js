// src/api/posts.js
import axios from 'axios';

const API_BASE_URL = '/api/comment'; // 백엔드 API 주소

export async function addComment(postId, commentInfo) {
  const posdData = {postId, commentInfo}
  const res = await axios.post(API_BASE_URL, posdData);
  return res.data;
}

export async function deleteComment(commentId, password) {
  const postData = {commentId, password};
  const res = await axios.delete(API_BASE_URL, {
    data: postData
  });
  return res.data;
}