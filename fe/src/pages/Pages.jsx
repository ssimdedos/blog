import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { fetchPost, increaseView } from "../api/posts";
import parse from "html-react-parser";
import { addComment, deleteComment } from "../api/comment";
import { useCookies } from 'react-cookie';
import CommentItem from "../components/CommentItem";
import { useToast, ToastContainer } from "../components/Toast";
import { Helmet } from "react-helmet-async";
import './Pages.css';
import './PagesPostDetails.css';
import './PostComment.css';
import { authAdmin } from "../api/users";

const stripHtml = (html) => html ? html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : '';

const buildCommentTree = (flatComments, parentId = null) => {
  const tree = [];
  flatComments.forEach(comment => {
    if (comment.parent_comment_id === parentId) {
      const children = buildCommentTree(flatComments, comment.id);
      tree.push({ ...comment, children: children.length > 0 ? children : undefined });
    }
  });
  return tree;
};

const PostSkeleton = () => (
  <div className="post-detail-container">
    <div className="skeleton skeleton-thumbnail" />
    <div className="skeleton skeleton-title" />
    <div className="skeleton skeleton-subtitle" />
    <div className="skeleton skeleton-meta" />
    <hr className="post-divider" />
    <div className="skeleton skeleton-line" />
    <div className="skeleton skeleton-line" />
    <div className="skeleton skeleton-line skeleton-line-short" />
    <div className="skeleton skeleton-line" />
    <div className="skeleton skeleton-line" />
    <div className="skeleton skeleton-line skeleton-line-short" />
  </div>
);

const Pages = () => {
  const navigate = useNavigate();
  const { id, slug } = useParams();
  const [cookie, setCookie] = useCookies([`viewedPost_${id}`]);
  const [postData, setPostData] = useState({});
  const [tags, setTags] = useState({});
  const [loading, setLoading] = useState(true);
  const [formerPost, setFormerPost] = useState({});
  const [nextPost, setNextPost] = useState({});
  const [tagRelatedPosts, setTagRelatedPosts] = useState([]);
  const [relatedPostTagName, setRelatedPostTagName] = useState('');

  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentTree, setCommentTree] = useState([]);

  const [commentForm, setCommentForm] = useState({ author: '', password: '', content: '' });
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyForm, setReplyForm] = useState({ author: '', password: '', content: '' });

  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    if (!cookie[`viewedPost_${id}`]) {
      const expires = new Date();
      expires.setHours(expires.getHours() + 3);
      setCookie(`viewedPost_${id}`, 'true', { path: '/', expires });
      increaseView(id);
    }
  }, [id, cookie, setCookie]);

  const getPost = async (id) => {
    try {
      const res = await fetchPost(id);
      if (!slug) {
        navigate(`/pages/${id}/${res.data.post.slug}`, { replace: true });
        return;
      }
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
        setComments(filterDeletedComments);
        setCommentTree(buildCommentTree(filterDeletedComments));
      }
    } catch (err) {
      console.error('Error', err);
      navigate('/', { replace: true });
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    getPost(id);
  }, [id, slug]);

  useEffect(() => {
    setCommentTree(buildCommentTree(comments));
  }, [comments]);

  const handleCommentFormChange = (e) => {
    const { name, value } = e.target;
    setCommentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleReplyFormChange = (e) => {
    const { name, value } = e.target;
    setReplyForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentForm.author || !commentForm.password || !commentForm.content) {
      showToast('작성자, 비밀번호, 내용을 모두 입력해주세요.', 'error');
      return;
    }
    if (commentForm.author === 'idea de mis dedos') {
      const authAdminRes = await authAdmin(commentForm.password);
      if (!authAdminRes.success) {
        showToast('비밀번호가 틀렸습니다.', 'error');
        return;
      }
    }
    try {
      const res = await addComment(id, commentForm);
      if (res.success) {
        const { newComment } = res;
        setComments(prev => [...prev, newComment]);
        setIsCommentSectionOpen(true);
        showToast(res.msg, 'success');
        setCommentForm({ author: '', password: '', content: '' });
      } else {
        showToast(res.msg || '댓글 등록에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('댓글 제출 오류:', error);
      showToast('댓글 제출 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyForm.author || !replyForm.password || !replyForm.content) {
      showToast('작성자, 비밀번호, 내용을 모두 입력해주세요.', 'error');
      return;
    }
    if (replyingToCommentId === null) {
      showToast('답글을 달 대상 댓글이 지정되지 않았습니다.', 'error');
      return;
    }
    if (replyForm.author === 'idea de mis dedos') {
      const authAdminRes = await authAdmin(replyForm.password);
      if (!authAdminRes.success) {
        showToast('비밀번호가 틀렸습니다.', 'error');
        return;
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
        setComments(prev => [...prev, res.newComment]);
        setReplyForm({ author: '', password: '', content: '' });
        setReplyingToCommentId(null);
        showToast(res.msg, 'success');
      } else {
        showToast('답글 등록에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('답글 제출 오류:', error);
      showToast('답글 제출 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleReplyClick = (commentId) => {
    setReplyingToCommentId(commentId);
    setReplyForm({ author: '', password: '', content: '' });
  };

  const toggleCommentSection = () => {
    setIsCommentSectionOpen(prev => !prev);
  };

  const handleCommentDelete = async (commentId, password) => {
    if (!password) {
      showToast('비밀번호를 입력해주세요.', 'error');
      return;
    }
    const res = await deleteComment(commentId, password);
    if (res.success) {
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId ? { ...comment, content: '삭제된 댓글입니다.', deleted_at: 1 } : comment
        )
      );
      showToast(res.msg, 'success');
    } else {
      showToast(res.msg, 'error');
    }
  };

  if (loading) {
    return <PostSkeleton />;
  }
  if (!postData) {
    return <div className="post-not-found">게시글을 찾을 수 없습니다.</div>;
  }

  const pageDescription = postData.sub_title || stripHtml(postData.content).substring(0, 160);
  const pageUrl = `https://ideademisdedos.com/pages/${postData.id}/${postData.slug}`;

  return (
    <div className="post-detail-container">
      <Helmet>
        <title>{postData.title} | Idea de mis dedos</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={postData.title} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={postData.thumbnail} />
        <meta property="og:url" content={pageUrl} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": postData.title,
            "description": pageDescription,
            "image": postData.thumbnail,
            "url": pageUrl,
            "datePublished": postData.created_at_raw ? new Date(parseInt(postData.created_at_raw)).toISOString() : undefined,
            "dateModified": postData.updated_at ? new Date(parseInt(postData.updated_at)).toISOString() : undefined,
            "author": {
              "@type": "Person",
              "name": postData.author
            },
            "publisher": {
              "@type": "Organization",
              "name": "Idea de mis dedos",
              "url": "https://ideademisdedos.com"
            },
            "mainEntityOfPage": pageUrl
          })}
        </script>
      </Helmet>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      {postData.thumbnail && (
        <div className="post-thumbnail-wrapper">
          <img src={postData.thumbnail} alt={postData.title} className="post-thumbnail" />
        </div>
      )}
      <h1 className="post-title">{postData.title}</h1>
      {postData.sub_title && (
        <p className="post-subtitle">{postData.sub_title}</p>
      )}
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
        <div>
          <div className="comment-header" onClick={toggleCommentSection}>
            <h3>댓글 <span className="comment-count">({comments.length})</span></h3>
            <span className={`comment-toggle-button ${isCommentSectionOpen ? 'open' : ''}`}>▼</span>
          </div>
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

      <div className="post-navigation">
        {formerPost ? (
          <div className="post-former">
            <Link to={`/pages/${formerPost.id}/${formerPost.slug}`}>
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
            <Link to={`/pages/${nextPost.id}/${nextPost.slug}`}>
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

      {relatedPostTagName && tagRelatedPosts.length > 0 && (
        <>
          <h3 className="related-post-h3">태그 #{relatedPostTagName} 관련 게시글</h3>
          <div className="related-posts-outer-wrapper">
            <div className="related-posts-container">
              {tagRelatedPosts.map(p => (
                <div className="tag-related-post" key={p.id}>
                  <Link to={`/pages/${p.id}/${p.slug}`} className="post-content-wrapper">
                    <img src={p.thumbnail} alt={p.title} />
                    <div className="post-title">
                      {p.title}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Pages;
