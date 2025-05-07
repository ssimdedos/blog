import '../assets/css/Font.css';
import './Header.css';
import { Link } from 'react-router-dom';

const HeaderComp = () => {
  return(
    <div>
      <a href='/' className='home-btn' >
        <p className="font-header" >Idea de mis dedos</p>
      </a>
      {/* <Link to={'/'} className='home-btn' >
        <p className="font-header" >Idea de mis dedos</p>
      </Link> */}
    </div>
  );
};

export default HeaderComp;