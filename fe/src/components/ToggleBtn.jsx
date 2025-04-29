import { useState } from 'react';
import '../assets/css/Toggle.css';

const ToggleBtn = ({children, onClick, isOn, index}) => {
  const [btnTxt, setBtnTxt] = useState(index[0]);

  const changeTxt = (e) => {
    onClick();
    if(e.target.value === index[0]) {
      setBtnTxt(index[1]);
    } else {
      setBtnTxt(index[0]);
    }
  }

  return (
    <div className="toggle-wrap">
      <input type="checkbox" value={btnTxt} id="toggle" class="toggle-input" onChange={changeTxt} checked={isOn} />
      <label for="toggle" class="toggle">
        <span class="toggle-button">
        </span>
        <span className='toggle-text' >{btnTxt}</span>
      </label>
    </div>
  )
};


export default ToggleBtn;

