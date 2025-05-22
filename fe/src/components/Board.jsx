import './Board.css';
import { useEffect, useState } from "react";
import ToggleBtn from '../components/ToggleBtn';
import { fetchPosts } from '../api/posts';
import { Link, useParams } from 'react-router-dom';


const Board = ({children, category}) => {
  const [toggleIsOn, setToggleIsOn] = useState(false);
  const [contentList, setContentList] = useState({});
  const [categoryName, setCategoryName] = useState(' ');
  let { id } = useParams();

  useEffect(()=> {
    if(id == undefined) {
      id = category;
    }
    fetchPosts(id).then(data => {
      // console.log(data);
      if (id == 'all') {
        setContentList(data);
      } else {
        setContentList(data.data1);
        setCategoryName(data.data2[0].name);
      }
    })
    
  }, [category, id]);

  const radioChange = () => {
    setToggleIsOn(!toggleIsOn);
  };

  return (
        <div className="main-container">
          <div className="main-header">
            <h3>{category=='all'?'전체 ':categoryName} 글 {contentList.length}개</h3>
            <div className='toggle-container'>
              <ToggleBtn onClick={radioChange} isOn={toggleIsOn} index={['앨범형', '목록형']} />
            </div>
          </div>
          <div className={toggleIsOn === false ? "main-contents view-type-album" : "main-contents view-type-list" } >
            { (contentList && contentList.length)
              ? contentList.map((con, i) => (
                <Link to={`/pages/${con.id}/${con.slug}`}  className='content-item' key={`content-id-${con.id}`} >
                  <div className='item-img-container' >
                    <img className='item-img' alt='게시글 이미지' src={con.thumbnail} />
                  </div>
                  <div className='item-container'>
                    <li className='item-title' key={i}>
                      <strong>{con.title}</strong> <em>{ con.subtitle }</em>
                    </li>
                    <li className='item-detail' >{con.summary}</li>
                    <li className='item-detail' style={{paddingTop:'5px'}} >{con.created_at}</li>
                  </div>
                </Link>
              ))
              : <h3>게시글 없음</h3>
            }
          </div>
        </div>
  )
};

export default Board;