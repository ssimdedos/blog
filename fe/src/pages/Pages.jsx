import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPost, increaseView } from "../api/posts";
import parse from "html-react-parser";
import { addComment, deleteComment } from "../api/comment";
import { useCookies } from 'react-cookie';
import CommentItem from "../components/CommentItem";
import './Pages.css';
import './PagesPostDetails.css';
import './PostComment.css';
import { authAdmin } from "../api/users";

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
  const { id } = useParams();
  const [cookie, setCookie] = useCookies([`viewedPost_${id}`]);
  const [postData, setPostData] = useState({});
  const [tags, setTags] = useState({});
  const [loading, setLoading] = useState(true);
  const [formerPost, setFormerPost] = useState({});
  const [nextPost, setNextPost] = useState({});
  const [tagRelatedPosts, setTagRelatedPosts] = useState([]);
  const [relatedPostTagName, setRelatedPostTagName] = useState('');

  // 댓글 섹션 상태
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
  const [comments, setComments] = useState([]); // 플랫한 댓글 목록
  const [commentTree, setCommentTree] = useState([]); // 트리 구조 댓글 목록

  const [commentForm, setCommentForm] = useState({ author: '', password: '', content: '' });
  const [replyingToCommentId, setReplyingToCommentId] = useState(null); // 답글 달 대상 댓글 ID
  const [replyForm, setReplyForm] = useState({ author: '', password: '', content: '' }); // 답글 폼 상태

  useEffect(() => {
    if (!cookie[`viewedPost_${id}`]) {
      const expires = new Date();
      expires.setHours(expires.getHours() + 3); // 24시간 유효
      setCookie(`viewedPost_${id}`, 'true', { path: '/', expires });
      // 백엔드에 해당 게시글의 조회수 증가 요청
      increaseView(id);
    }
  }, [id, cookie, setCookie]);

  const getPost = async (id) => {
    try {
      fetchPost(id).then((res) => {
        setPostData(res.data.post);
        setTags(res.data.tags);
        setFormerPost(res.data.formerPost);
        setNextPost(res.data.nextPost);
        setTagRelatedPosts(res.data.tagRelatedPostArray);
        setRelatedPostTagName(res.data.highestPosCntTagName);
        if (res.data.comments) {
          const filterDeletedComments = res.data.comments.map(comment =>
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    getPost(id);
  }, [id]);

  useEffect(() => {
    setCommentTree(buildCommentTree(comments));
    // console.log('Comments updated, new comment tree:', buildCommentTree(comments)); // 디버깅용
  }, [comments]);

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
      const authAdminRes = await authAdmin(commentForm.password);
      if (!authAdminRes.success) {
        alert('비밀번호가 틀렸습니다.');
        return
      }
    }
    try {
      const res = await addComment(id, commentForm);
      if (res.success) {
        const { newComment } = res;
        const newFlatComments = [...comments, newComment];
        setComments(newFlatComments);
        setIsCommentSectionOpen(true);
        alert(res.msg);
        setCommentForm({ author: '', password: '', content: '' });
      } else {
        alert(res.msg || '댓글 등록에 실패했습니다.');
      }
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
    if (replyForm.author === 'idea de mis dedos') {
      const authAdminRes = await authAdmin(replyForm.password);
      if (!authAdminRes.success) {
        alert('비밀번호가 틀렸습니다.');
        return
      }
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
        setReplyForm({ author: '', password: '', content: '' });
        setReplyingToCommentId(null);
        alert(res.msg);
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
        // const updatedFlatComments = comments.filter(comment => comment.id !== commentId); //이건 완전 빼버리는거. 트리구조에 문제 생길 수 있음
        const updatedFlatComments = comments.map(comment =>
          comment.id === commentId ? { ...comment, content: '삭제된 댓글입니다.', deleted_at: 1 } : comment
        );
        setComments(updatedFlatComments);
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
        <div className="tag-items-column-for-page">
          {tags.map((tag) => (
            <Link to={`/tag/${tag.id}/${tag.name}`} key={`tag-${tag.id}`} className="tag-link-item">
              <span className="tag-name"># {tag.name}</span>
              {tag.postCnt > 0 && <span className="tag-post-count">{tag.postCnt}</span>}
            </Link>
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

      {/* 게시글 네비게이션 섹션 */}
      <div className="post-navigation">
        {formerPost ? (
          <div className="post-former">
            <Link to={`/pages/${formerPost.id}/${formerPost.slug}`} >
              <img src={formerPost.thumbnail} alt={`이전 포스트 썸네일: ${formerPost.title}`} />
              <div className="post-text-content">
                <span>이전 포스트</span>
                <span>{formerPost.title}</span>
              </div>
            </Link>
          </div>
        ) : (
          <div className="post-placeholder former-placeholder"></div>
        )}

        {nextPost ? (
          <div className="post-next">
            <Link to={`/pages/${nextPost.id}/${nextPost.slug}`} >
              <div className="post-text-content">
                <span>다음 포스트</span>
                <span>{nextPost.title}</span>
              </div>
              <img src={nextPost.thumbnail} alt={`다음 포스트 썸네일: ${nextPost.title}`} />
            </Link>
          </div>
        ) : (
          <div className="post-placeholder next-placeholder"></div>
        )}
      </div>
      {/* 관련 태그 게시글 목록 */}
      <h3 className="related-post-h3" >태그 #{relatedPostTagName} 관련 게시글</h3>
      <div className="related-posts-outer-wrapper"> {/* 새로 추가된 래퍼 */}
        <div className="related-posts-container">
          {tagRelatedPosts.length > 0 ? (
            tagRelatedPosts.map(p => (
              <div className="tag-related-post" key={p.id}>
                <Link to={`/pages/${p.id}/${p.slug}`} className="post-content-wrapper">
                  <img src={p.thumbnail} alt={p.title} />
                  <div className="post-title">
                    {p.title}
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  )
};

export default Pages;