import { useEffect, useState } from "react";
import { createPost } from "../api/posts.js";
import CustomEditor from "../components/CustomEditor.tsx"
import WriteSidebarComp from "../components/WriteSidebar.jsx";
import './WritePost.css';

const WritePost = () => {
  const [content, setContent] = useState("");
  const [inputs, setInputs] = useState({
    title: "",
    subtitle: "",
    author: "idea de mis dedos",
    slug: "",
    content: "",
  });
  
  const { title, subtitle, author, slug } = inputs;
  
  const inputHandlerChange = (e) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name] : value,
    });
  };

  const clickPostbtn = (data) => {
    createPost(data);
  };

  useEffect(()=> {
    // console.log(content);
    setInputs({
      ...inputs,
      ['content'] : content,
    });
    // console.log(inputs);
  },[content]);

  return (
    <div className="write-container">
      <div>
        <h2>게시글 작성</h2>
        <div>
          <label>
            제목<input type='text' name="title" value={title} placeholder='제목을 입력하세요' onChange={inputHandlerChange} /><br />
          </label>
          <label>
            부제목<input type='text' name="subtitle" value={subtitle} placeholder='필수 항목 아님' onChange={inputHandlerChange} /><br />
          </label>
          <label>
            작성자<input type='text' name="author" value={author} placeholder='Idea de mis dedos' onChange={inputHandlerChange} /><br />
          </label>
          <label>
            슬러그<input type='text' name="slug" value={slug} placeholder='슬러그를 입력하세요' onChange={inputHandlerChange} /><br />
          </label>
        </div>
        <CustomEditor setContent={setContent} />
      </div>
      <WriteSidebarComp clickPostbtn={clickPostbtn} />
    </div>
  )
}

export default WritePost;