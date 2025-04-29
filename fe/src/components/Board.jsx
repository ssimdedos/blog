import './Board.css';
import { useEffect, useState } from "react";
import ToggleBtn from '../components/ToggleBtn';
import { fetchPosts } from '../api/posts';
import { useParams } from 'react-router-dom';


const Board = ({children, category}) => {
  const [toggleIsOn, setToggleIsOn] = useState(false);
  const [contentList, setContentList] = useState({});
  let { id } = useParams();

  useEffect(()=> {
    if(id == undefined) {
      id = category;
    }
    fetchPosts(id).then(data => {
      console.log(data);
      setContentList(data);
    })
    
  }, [category, id]);

  const radioChange = () => {
    setToggleIsOn(!toggleIsOn);
  };

  return (
        <div className="main-container">
          <div className="main-header">
            <h3>전체 글 10개</h3>
            <div className='toggle-container'>
              <ToggleBtn onClick={radioChange} isOn={toggleIsOn} index={['앨범형', '목록형']} />
            </div>
          </div>
          <div className={toggleIsOn === false ? "main-contents view-type-album" : "main-contents view-type-list" } >
            {/* contentList.length != undefined && contentList.length !=0 */}
            { (contentList && contentList.length)
              ? contentList.map((con, i) => (
                <div className='content-item' key={`content-id-${con.id}`} >
                  <div className='item-img-container' >
                    <img className='item-img' alt='게시글 이미지' src={`/img/${con.thumbnail}`} />
                  </div>
                  <div className='item-container'>
                    <li className='item-title' key={i}>
                      <strong>{con.title}</strong> – <em>부제</em>
                    </li>
                    <li className='item-detail' >{con.content}</li>
                  </div>
                </ div>
              ))
              : <h3>게시글 없음</h3>
            }
          </div>
        </div>
  )
};

export default Board;