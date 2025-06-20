import { fetchCategory } from "../api/category";

const WriteSidebarComp = () => {
  const [categoryList, setCategoryList] = useState({});
  useEffect(()=> {
    // console.log('useEffect');
    fetchCategory().then(data => {
      // console.log(data);
      setCategoryList(data);
    });
  }, []);
  return(
    <div>
      <h3>카테고리 목록</h3>
      <h3>부 카테고리 목록</h3>
      <h3>공개 설정</h3>
      <h3>태그 편집</h3>
      <h3>발행 시간</h3>
      <h3>공지사항으로 등록</h3>
      <h3>게시글 등록</h3>
      
    </div>
  );
};

export default WriteSidebarComp;