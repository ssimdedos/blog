import { useEffect, useState } from "react";
import { fetchTags } from "../api/tags";
import { Link } from 'react-router-dom';
import './Tags.css';

const Tags = () => {
  // const [groupedTags, setGroupedTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tagGroup, setTagGroup] = useState([]);

  const onLoadTags = async () => {
    try {
      setLoading(true);
      const res = await fetchTags();
      // console.log(res);
      if (res.success) {
        setTagGroup(res.tags);
      }

    } catch (err) {
      console.error('태그 로드 중 에러 발생:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    onLoadTags();
  }, []);

  if (loading) {
    return <div className="tag-appendix-loading">태그 목록을 불러오는 중...</div>;
  }

  return (
    <div className="tag-appendix-container">
      {/* <h1 className="tag-appendix-title">태그 찾아보기</h1>
      <p className="tag-appendix-subtitle">초성별로 블로그의 태그를 탐색해보세요.</p> */}

      {tagGroup.length === 0 ? (
        <p className="no-tags-message">아직 등록된 태그가 없습니다.</p>
      ) : (
        // 모든 초성 그룹 섹션들을 담을 2단 컬럼 컨테이너
        <div className="initial-group-columns">
          {tagGroup.map((group) => (
            <div key={group.initial} className="initial-group-section">
              <h2 className="initial-consonant-header">{group.initial}</h2>
              <div className="tag-items-column"> 
                {group.tags.map((tag) => (
                  <Link to={`/tag/${tag.id}/${tag.name}`} key={`tag-${tag.id}`} className="tag-link-item">
                    <span className="tag-name"># {tag.name}</span>
                    {tag.postCnt > 0 && <span className="tag-post-count">{tag.postCnt}</span>}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tags;