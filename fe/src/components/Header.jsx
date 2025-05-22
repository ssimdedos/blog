import '../assets/css/Font.css';
import './Header.css';
import { Link } from 'react-router-dom';

const HeaderComp = () => {
  return(
    <div >
      <a href='/' className='home-btn'>
        <div className='logo-box'>
          <img src='http://localhost:7303/images/logo/logo192.png' />
        </div>
        <div className='font-box' >
          <p className="font-header" >내 손가락들의 생각:<span style={{fontSize:'17px'}} > Idea de mis dedos</span></p>
        </div>
      </a>
    </div>
  );
};

export default HeaderComp;