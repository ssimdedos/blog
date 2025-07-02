import { useEffect, useState } from "react";
import { fetchCategory, fetchSubcategory } from "../api/category";
import { Link } from "react-router-dom";
import './Sidebar.css';
import { getHotPosts } from "../api/posts";

const SidebarComp = () => {
  const [categoryList, setCategoryList] = useState([]);
  const [subcategoryList, setSubcategoryList] = useState([]);
  const [openCategories, setOpenCategories] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [hotPosts, setHotPosts] = useState([]);

  useEffect(() => {
    // console.log('useEffect');
    fetchCategory().then(data => {
      setCategoryList(Array.isArray(data) ? data : []);
    }).catch(error => {
      console.error("카테고리 불러오기 실패:", error);
      setCategoryList([]); // 에러 발생 시 빈 배열로 설정
    });
    fetchSubcategory('all').then(data => {
      setSubcategoryList(Array.isArray(data) ? data : []);
    }).catch(error => {
      console.error("서브카테고리 불러오기 실패:", error);
      setSubcategoryList([]); // 에러 발생 시 빈 배열로 설정
    });
    getHotPosts().then(data => {
      setHotPosts(data);
    }).catch(error => {
      console.error('인기글 가져오기 실패:', error);
    });
  }, []);


  // 미디어 쿼리 리스너 설정
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)'); // 모바일 브레이크포인트와 동일하게
    const handleMediaQueryChange = (e) => {
      setIsMobile(e.matches);
    };
    // 초기 상태 설정
    setIsMobile(mediaQuery.matches);
    // 리스너 등록
    mediaQuery.addEventListener('change', handleMediaQueryChange);
    // 컴포넌트 언마운트 시 리스너 해제
    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);

  // 카테고리 클릭 시 서브카테고리 토글
  const toggleCategory = (categoryId) => {
    if (!isMobile) return; // 모바일이 아니면 토글 기능 비활성화

    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId] // 해당 카테고리의 open 상태를 반전
    }));
  };

  return (
    <div>
      {categoryList.length > 0 && Array.isArray(subcategoryList) && subcategoryList.length > 0
        ? categoryList.map((c, i) => {
          return (
            <div className='category-box' key={`category-box-${i}`} onClick={() => toggleCategory(c.id)} >
              <li className="category-li" key={`category-id-${c.id}`}  >
                <Link to={`/category/${c.id}`} >{c.name}
                </Link>
                {isMobile && (
                  <span className={`toggle-icon ${openCategories[c.id] ? 'rotated' : ''}`} >
                    {openCategories[c.id] ? ' ▲' : ' ▼'}
                  </span>
                )}
              </ li>
              {(
                !isMobile || // 모바일이 아니면 항상 보임
                openCategories[c.id] // 모바일이고 현재 카테고리가 열려 있으면 보임
              ) && (
                  <ul className={`subcategory-list ${isMobile ? 'collapsible' : ''} ${openCategories[c.id] ? 'open' : 'closed'}`}>
                    {subcategoryList
                      .filter((e) => e.category_id === c.id)
                      .map((e) => (
                        <li className="subcategory-li" key={`subcategory-id-${e.id}`}>
                          <Link to={`/category/${c.id}/sub/${e.id}`} className="subcategory-link">
                            └ {e.name}
                          </Link>
                        </li>
                      ))}
                  </ul>
                )}
            </div>
          )
        })
        : <h2>메뉴 로딩 중</h2>
      }
      <h4 className="hotPost-h4" >인기글</h4>
      <div className="hotPost-container" >
        {hotPosts.length > 0 ?
          hotPosts.map((p => (
            <li className="hotPost-li" key={`category-id-${p.id}`}  >
              <Link to={`/pages/${p.id}/${p.slug}`} >{p.title}
              </Link>
            </ li>
          )))
          : <h2>인기글 로딩 중</h2>}
      </div>
    </div>
  );
};

export default SidebarComp;