import React from 'react';
import axios from 'axios';


const API_BASE_URL = '/api/posts'; // 백엔드 API 주소

// 게시글 목록 가져오기
export async function fetchPosts(id) {
  const res = await axios.get(API_BASE_URL, {
    params: { categoryId: id }
  });
  if (id == 'all') {
    return res.data;
  } else {
    // console.log(res.data.data2);
    return res.data;
  }
}

// 게시글 관리 전부 가져오기기
export async function fetchPostsAdmin(filters) {
  try {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.author) params.append('author', filters.author);
    if (filters.isPublished !== 'all') params.append('isPublished', filters.isPublished); // 'all'이 아니면 전송
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const res = await axios.get(`${API_BASE_URL}/${process.env.REACT_APP_ADMIN}?${params.toString()}`);
    if (res.data.success) {
      return res.data;
    }
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    return [];
  }
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

// 수정할 게시글 가져오기
export async function fetchPostForUpdate(id) {
  const res = await axios.get(`${API_BASE_URL}/update/${id}`);
  return res.data;
}

// 게시글 삭제
export async function deletePost(id) {
  const res = await axios.delete(`${API_BASE_URL}/${id}`);
  return res.data;
}

// 게시글 등록 이미지 처리
export async function imageSaveFromContents(content) {
  // 게시글에 이미지가 있을 경우 정규식 추출
  const imgSrcArray = [];
  const imgUrlArray = [];
  const imgOldPathArray = [];
  const preExitstImgs = [];

  const gainSource = /<img[^>]*src=["']([^"']*)["'][^>]*>/g;
  // 이미지 처리
  let match;
  while ((match = gainSource.exec(content)) !== null) {
    // console.log(process.env.REACT_APP_IMAGE_PATH);
    if (match[1].includes(`${process.env.REACT_APP_IMAGE_PATH}`)) {
      preExitstImgs.push(match[1]);
      console.log(`이미 저장된 이미지, ${match[1]}`);
      continue
    } else {
      imgSrcArray.push(match[1]);

      // src값 blob으로 변경
      const base64Data = match[1]; // 전체 Base64 URI (예: data:image/png;base64,...)
      const parts = base64Data.split(',');
      const mimeType = parts[0].match(/:(.*?);/)[1]; // "image/jpeg" 또는 "image/png" 등 추출
      const base64Content = parts[1];

      const byteString = atob(base64Content);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([ia], { // base64 -> blob
        type: mimeType
      });

      const fileExtension = mimeType.split('/')[1]; // jpeg, png 등
      const fileName = `image_${Date.now()}.${fileExtension}`;
      const file = new File([blob], fileName, { type: mimeType });
      // file formData에 넣기
      const formData = new FormData();
      formData.append("file", file);
      console.log('formData: ', formData)

      // 이미지 백엔드로 전송
      try {
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data' // Axios가 FormData를 감지하면 자동으로 설정하긴 함함
          }
        };

        const response = await axios.post(API_BASE_URL + '/uploadImgFolder', formData, config);

        if (response.data.success) {
          console.log('이미지 서버에 업로드 성공', response.data);
          imgUrlArray.push(response.data.url);
          imgOldPathArray.push(response.data.filePath);

          // console.log('imgUrlArray에 추가', imgUrlArray); 
        } else {
          console.log('이미지 서버 업로드 실패 응답:', response);
          alert('이미지를 서버에 업로드하는데에 실패했습니다.');
        }
      } catch (err) {
        console.log('이미지 서버 업로드 중 에러 발생:', err);
        alert('이미지 서버 업로드 중 에러가 발생했습니다.');
      }

      // 이 부분은 정규식이 빈 문자열을 매치하는 경우 무한 루프에 빠지는 것을 방지합니다.
      if (match.index === gainSource.lastIndex) {
        gainSource.lastIndex++;
      }
    }
  }
  // 이미지 저장 while 루프 종료 //
  let finalContent = content;
  imgSrcArray.forEach((base64Url, index) => {
    // Base64 URL을 서버에서 반환받은 URL로 교체
    finalContent = finalContent.replace(base64Url, imgUrlArray[index]);
  });
  // console.log(preExitstImgs);
  // console.log('이미지 서버 저장 중 저장해야될 이미지',imgUrlArray[0]);
  const finalData = {
    finalContent,
    thumbnailUrl: preExitstImgs[0] ? preExitstImgs[0] : imgUrlArray[0],
    imgUrlArray,
    imgOldPathArray
  }
  return finalData
}