import './Sidebar.css';
import { useEffect, useState } from "react";
import { fetchCategory, fetchSubcategory } from "../api/category";
import { Link } from "react-router-dom";

const SidebarComp = () => {
  const [categoryList, setCategoryList] = useState([]);
  const [subcategoryList, setSubcategoryList] = useState([]);
  const [openCategories, setOpenCategories] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // console.log('useEffect');
    fetchCategory().then(data => {
      // 카테고리도 마찬가지로 방어 코드 추가
      setCategoryList(Array.isArray(data) ? data : []);
    }).catch(error => {
      console.error("카테고리 불러오기 실패:", error);
      setCategoryList([]); // 에러 발생 시 빈 배열로 설정
    });
    fetchSubcategory('all').then(data => {
      // 데이터가 배열이 아니거나 null/undefined인 경우를 대비하여 빈 배열로 대체
      setSubcategoryList(Array.isArray(data) ? data : []);
    }).catch(error => {
      console.error("서브카테고리 불러오기 실패:", error);
      setSubcategoryList([]); // 에러 발생 시 빈 배열로 설정
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
      {categoryList.length > 0 && Array.isArray(subcategoryList) && subcategoryList.length > 0 // subcategoryList가 배열인지 추가 확인
        ? categoryList.map((c, i) => {
          return (
            <div className='category-box' key={`category-box-${i}`} onClick={() => toggleCategory(c.id)} >
              {/* ... 카테고리 렌더링 ... */}
              {(
                !isMobile ||
                openCategories[c.id]
              ) && (
                  <ul className={`subcategory-list ${isMobile ? 'collapsible' : ''} ${openCategories[c.id] ? 'open' : 'closed'}`}>
                    {Array.isArray(subcategoryList) && // 이곳에서도 다시 확인 (더 안전하게)
                      subcategoryList
                        .filter((e) => e.category_id === c.id)
                        .map((e) => (
                          <li className="subcategory-li" key={`subcategory-id-${e.id}`}>
                            <Link to={`/category/<span class="math-inline">\{c\.id\}/sub/</span>{e.id}`} className="subcategory-link">
                              └ {e.name}
                            </Link>
                          </li>
                        ))}
                  </ul>
                )}
            </div>
          )
        })
        : <h2>로딩 중</h2>
      }
    </div>
  );
};

export default SidebarComp;