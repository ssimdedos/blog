import { useState } from "react";

const CommentItem = ({ comment, postId, onReplyClick, onCommentSubmit, replyingToCommentId, replyForm, handleReplyFormChange, onCommentDelete, depth = 0 }) => {
  const isReplying = replyingToCommentId === comment.id;
  const [showDeletePasswordInput, setShowDeletePasswordInput] = useState(false); // 삭제 비밀번호 입력창 표시 여부
  const [deletePassword, setDeletePassword] = useState(''); // 삭제 비밀번호 입력 값
  const isDeleted = comment.deleted_at && comment.deleted_at !== '0';

  // "삭제" 버튼 클릭 핸들러
  const handleDeleteClick = () => {
    setShowDeletePasswordInput(prev => !prev); // 입력창 토글
    setDeletePassword(''); // 입력창 열릴 때 비밀번호 초기화
  };

  // 삭제 비밀번호 입력 필드 변경 핸들러
  const handleDeletePasswordChange = (e) => {
    setDeletePassword(e.target.value);
  };

  // 비밀번호 확인 후 삭제 요청 핸들러
  const handleConfirmDelete = (e) => {
    e.preventDefault(); // 폼 기본 제출 방지
    if (!deletePassword) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    onCommentDelete(comment.id, deletePassword);
    setShowDeletePasswordInput(false); // 삭제 요청 후 입력창 닫기
    setDeletePassword(''); // 비밀번호 초기화
  };

  return (
    <div className={`comment-item ${depth > 0 ? 'is-reply' : ''}`}>
      <div className="comment-meta">
        {comment.author === 'idea de mis dedos' ? (
          <div className="admin-comment-img" >
            <img src={process.env.REACT_APP_LOGO_URL} />
          </div>) : <></>
        }
        {comment.author === 'idea de mis dedos' ?
          <span className="comment-author admin-comment">{comment.author}</span>
          :
          <span className="comment-author">{comment.author}</span>
        }
        <span className="comment-date">{comment.created_at}</span>
        {!isDeleted && (
          <>
            <button className="reply-button" onClick={() => onReplyClick(comment.id)}>답글 달기</button>
            <button className="delete-button" onClick={handleDeleteClick}>삭제</button>
          </>
        )}
      </div>
      {showDeletePasswordInput && (
        <form className="delete-password-form" onSubmit={handleConfirmDelete}>
          <input
            type="password"
            placeholder="비밀번호"
            value={deletePassword}
            onChange={handleDeletePasswordChange}
            required
            autoFocus
          />
          <button type="submit" className="confirm-delete-button">확인</button>
          <button type="button" className="cancel-delete-button" onClick={() => setShowDeletePasswordInput(false)}>취소</button>
        </form>
      )}
      <div className="comment-text" >
        {isDeleted ? (
          <p className="deleted-comment-message">{comment.content}</p>
        ) : (
          <p>{comment.content}</p>
        )}
      </div>

      {/* 답글 폼 */}
      {isReplying && (
        <form className="comment-reply-form" onSubmit={onCommentSubmit}>
          <div className="form-group">
            <input
              type="text"
              id={`reply-author-${comment.id}`}
              name="author"
              placeholder="작성자"
              value={replyForm.author}
              onChange={handleReplyFormChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              id={`reply-password-${comment.id}`}
              name="password"
              placeholder="비밀번호"
              value={replyForm.password}
              onChange={handleReplyFormChange}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              style={{ width: '340px', height: '50px' }}
              id={`reply-content-${comment.id}`}
              name="content"
              value={replyForm.content}
              onChange={handleReplyFormChange}
              required
              placeholder="내용을 입력해 주세요 ..."
            ></textarea>
          </div>
          <div className="comment-form-actions-bottom">
            <label style={{ visibility: 'hidden' }} className="private-comment-checkbox">
              <input type="checkbox" />
              비밀글
            </label>
            <div className="reply-actions">
              <button type="submit" className="submit-comment-button">등록</button>
              <button type="button" className="cancel-reply-button" onClick={() => onReplyClick(null)}>취소</button>
            </div>
          </div>
        </form>
      )}

      {/* 자식 댓글 (답글) 목록 */}
      {comment.children && comment.children.length > 0 && (
        <div className="comment-replies">
          {comment.children.map(childComment => (
            <CommentItem
              key={`child-comment-${childComment.id}`}
              comment={childComment}
              postId={postId}
              onReplyClick={onReplyClick}
              onCommentSubmit={onCommentSubmit} // 답글 제출 핸들러도 전달
              replyingToCommentId={replyingToCommentId}
              replyForm={replyForm}
              handleReplyFormChange={handleReplyFormChange}
              onCommentDelete={onCommentDelete}
              depth={depth + 1} // 깊이 증가
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;