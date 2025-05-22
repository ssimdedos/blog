import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPost } from "../api/posts";
import parse from "html-react-parser";
import './Pages.css';

const Pages = () => {
  const [postData, setPostData] = useState({});
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  const getPost = async (id) => {
    try {
      fetchPost(id).then((data) => {
        setPostData(data);
      });
    } catch (err) {
      console.err('Error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPost(id);
  }, [id]);

  if (loading) {
    return <div className="post-loading">게시글 로딩 중...</div>;
  }
  if (!postData) {
    return <div className="post-not-found">게시글을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="post-detail-container">
      {
        postData.thumbnail && (
          <div className="post-thumbnail-wrapper">
            <img src={postData.thumbnail} alt={postData.title} className="post-thumbnail" />
          </div>
        )
      }
      < h1 className="post-title">{postData.title}</h1>
      {
        postData.sub_title && (
          <h2 className="post-subtitle">{postData.sub_title}</h2>
        )
      }
      <div className="post-meta">
        <span className="post-author">작성자: {postData.author}</span>
        <span className="post-date"> | 작성일: {postData.created_at}</span>
        {/*
        {postData.category_name && ( // 카테고리 정보가 있다면
          <span className="post-category"> | 카테고리: {postData.category_name}</span>
        )}
        {postData.subcategory_name && ( // 서브카테고리 정보가 있다면
          <span className="post-subcategory"> | 서브카테고리: {postData.subcategory_name}</span>
        )}
        */}
      </div>
      <hr className="post-divider" />
      <div className="post-content">
        {postData.content && postData.content.length > 0 ? parse(postData.content) : <div>내용 불러오는 중...</div> }
        {/* {htmlToDOM(postData.content)} */}
      </div>

      {/* 게시글 태그 (있을 경우)
      {postData.tags && postData.tags.length > 0 && (
        <div className="post-tags">
          {postData.tags.map(tag => (
            <span key={tag.id} className="post-tag">#{tag.name}</span>
          ))}
        </div>
      )}
      */}

      {/* 하단 네비게이션 또는 댓글 섹션 등 추가 가능 */}
      <div className="post-navigation">
        {/* 이전/다음 게시글 링크 */}
      </div>

      {/* 댓글 섹션 (추후 추가) */}
    </div>
  )
};

export default Pages;