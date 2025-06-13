import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPost } from "../api/posts";
import parse from "html-react-parser";
import { addComment, deleteComment } from "../api/comment";
import CommentItem from "../components/CommentItem";
import './Pages.css';
import './PagesPostDetails.css';
import './PostComment.css';


// 헬퍼 함수: 플랫한 댓글 목록을 트리 구조로 변환
const buildCommentTree = (flatComments, parentId = null) => {
  const tree = [];
  flatComments.forEach(comment => {
    if (comment.parent_comment_id === parentId) {
      // created_at이 Date 객체가 아닌 문자열이라면 여기서 포맷팅
      const children = buildCommentTree(flatComments, comment.id);
      tree.push({ ...comment, children: children.length > 0 ? children : undefined });
    }
  });
  return tree;
};


const Pages = () => {
  const [postData, setPostData] = useState({});
  const [tags, setTags] = useState({});
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [formerPost, setFormerPost] = useState({});
  const [nextPost, setNextPost] = useState({});

  // 댓글 섹션 상태
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
  const [comments, setComments] = useState([]); // 플랫한 댓글 목록
  const [commentTree, setCommentTree] = useState([]); // 트리 구조 댓글 목록

  const [commentForm, setCommentForm] = useState({ author: '', password: '', content: '' });
  const [replyingToCommentId, setReplyingToCommentId] = useState(null); // 답글 달 대상 댓글 ID
  const [replyForm, setReplyForm] = useState({ author: '', password: '', content: '' }); // 답글 폼 상태


  const getPost = async (id) => {
    try {
      fetchPost(id).then((data) => {
        // console.log(data);
        setPostData(data.post);
        setTags(data.tags);
        setFormerPost(data.formerPost);
        setNextPost(data.nextPost);
        if (data.comments) {
          const filterDeletedComments = data.comments.map(comment =>
            comment.deleted_at !== '0' ? { ...comment, content: '삭제된 댓글입니다.' } : comment
          );
          setComments(filterDeletedComments); // 플랫 목록 저장
          setCommentTree(buildCommentTree(filterDeletedComments)); // 트리 구조 생성 및 저장
        }
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

  // 댓글 폼 입력 핸들러
  const handleCommentFormChange = (e) => {
    const { name, value } = e.target;
    setCommentForm(prev => ({ ...prev, [name]: value }));
  };

  // 답글 폼 입력 핸들러 (대댓글)
  const handleReplyFormChange = (e) => {
    const { name, value } = e.target;
    setReplyForm(prev => ({ ...prev, [name]: value }));
  };

  // 댓글 등록 핸들러
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentForm.author || !commentForm.password || !commentForm.content) {
      alert('작성자, 비밀번호, 내용을 모두 입력해주세요.');
      return;
    }
    if (commentForm.author === 'idea de mis dedos') {
      if (commentForm.password !== process.env.REACT_APP_ADMIN_PASSWORD_FOR_COMMENT) {
        alert('비밀번호가 틀렸습니다.');
        return
      }
    }
    try {
      const res = await addComment(id, commentForm);
      // console.log(res);
      setComments(prev => [...prev, res.newComment]);
      setCommentForm({ author: '', password: '', content: '' });
      alert(res.msg);
    } catch (error) {
      console.error('댓글 제출 오류:', error);
      alert('댓글 제출 중 오류가 발생했습니다.');
    }
  };

  // 대댓글 등록 핸들러
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyForm.author || !replyForm.password || !replyForm.content) {
      alert('작성자, 비밀번호, 내용을 모두 입력해주세요.');
      return;
    }
    if (replyingToCommentId === null) {
      alert('답글을 달 대상 댓글이 지정되지 않았습니다.');
      return;
    }
    try {
      const replyData = {
        author: replyForm.author,
        password: replyForm.password,
        content: replyForm.content,
        parent_comment_id: replyingToCommentId
      };
      const res = await addComment(id, replyData);
      if (res.success) {
        const newFlatComments = [...comments, res.newComment];
        setComments(newFlatComments);
        setCommentTree(buildCommentTree(newFlatComments));
        setReplyForm({ author: '', password: '', content: '' });
        setReplyingToCommentId(null);
        alert('답글이 등록되었습니다.');
      } else {
        alert('답글 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('답글 제출 오류:', error);
      alert('답글 제출 중 오류가 발생했습니다.');
    }
  };


  // 답글 달기 버튼 클릭 시
  const handleReplyClick = (commentId) => {
    setReplyingToCommentId(commentId); // 답글 폼을 열 댓글 ID 설정
    setReplyForm({ author: '', password: '', content: '' }); // 답글 폼 초기화
  };

  // 댓글 섹션 토글 핸들러
  const toggleCommentSection = () => {
    setIsCommentSectionOpen(prev => !prev);
  };

  // 댓글 삭제 핸들러
  const handleCommentDelete = async (commentId, password) => {
    if (!password) {
      alert('비밀번호를 입력해주세요.');
      return;
    } else {
      const res = await deleteComment(commentId, password);
      if (res.success) {
        // const updatedFlatComments = comments.filter(comment => comment.id !== commentId);
        const updatedFlatComments = comments.map(comment =>
          comment.id === commentId ? { ...comment, content: '삭제된 댓글입니다.' } : comment
        );
        setComments(updatedFlatComments);
        setCommentTree(buildCommentTree(updatedFlatComments));
        alert(res.msg);
      }
      else alert(res.msg);
    }
  };

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
      < h3 className="post-title">{postData.title}</h3>
      {
        postData.sub_title && (
          <h2 className="post-subtitle">{postData.sub_title}</h2>
        )
      }
      <div className="post-meta">
        <span className="post-author">작성자: {postData.author}</span>
        <span className="post-date"> | 작성일: {postData.created_at}</span>
      </div>
      <hr className="post-divider" />
      <div className="post-content">
        {postData.content && postData.content.length > 0 ? parse(postData.content) : <div>내용 불러오는 중...</div>}
      </div>

      {tags && tags.length > 0 && (
        <div className="post-tags">
          {tags.map(tag => (
            <span key={`tag-${tag.id}`} className="post-tag">#{tag.name}</span>
          ))}
        </div>
      )}

      <div className="comment-container">
        <div >
          <div className="comment-header" onClick={toggleCommentSection} >
            <h3>댓글 <span className="comment-count">({comments.length})</span></h3>
            <span className={`comment-toggle-button ${isCommentSectionOpen ? 'open' : ''}`}>▼</span>
          </div>
          {/* 최상위 댓글 작성 폼 */}
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <div className="form-group">
              <label htmlFor="comment-author"></label>
              <input type="text" id="comment-author" placeholder="작성자" name="author" value={commentForm.author} onChange={handleCommentFormChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="comment-password"></label>
              <input type="password" id="comment-password" placeholder="비밀번호" name="password" value={commentForm.password} onChange={handleCommentFormChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="comment-content"></label>
              <textarea id="comment-content" name="content" placeholder="댓글을 입력해주세요 ..." value={commentForm.content} onChange={handleCommentFormChange} required></textarea>
            </div>
            <div className="comment-form-actions-bottom">
              <label style={{ visibility: 'hidden' }} className="private-comment-checkbox">
                <input type="checkbox" />
                비밀글
              </label>
              <button type="submit" className="submit-comment-button">댓글 등록</button>
            </div>
          </form>
        </div>

        <div className={`comment-section-collapsible ${isCommentSectionOpen ? 'open' : ''}`}>

          {/* 댓글 목록 */}
          <div className="comment-list">
            {commentTree.length > 0 ? (
              commentTree.map(comment => (
                  <CommentItem
                    key={`comment-${comment.id}`}
                    comment={comment}
                    postId={id}
                    onReplyClick={handleReplyClick}
                    onCommentSubmit={handleReplySubmit}
                    replyingToCommentId={replyingToCommentId}
                    replyForm={replyForm}
                    handleReplyFormChange={handleReplyFormChange}
                    onCommentDelete={handleCommentDelete}
                  />
              ))
            ) : (
              <p className="no-comments-message">아직 댓글이 없습니다. 첫 댓글을 남겨주세요!</p>
            )}
          </div>
        </div>
      </div>

      {/* 하단 다음 / 이전 게시글 네비게이션 */}
      <div className="post-navigation">
        {nextPost ?
          <div className="post-next">
            <Link to={`/pages/${nextPost.id}/${nextPost.slug}`} >
              <img src={nextPost.thumbnail} />
              <span>다음 포스트</span>
              <span>{nextPost.title}</span>
            </Link>
          </div>
          : <></>}
        {formerPost ?
          <div className="post-former">
            <Link to={`/pages/${formerPost.id}/${formerPost.slug}`} >
              <img src={formerPost.thumbnail} />
              <span>이전 포스트</span>
              <span>{formerPost.title}</span>
            </Link>
          </div>
          : <></>}
      </div>
    </div>
  )
};

export default Pages;