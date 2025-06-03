import { useEffect, useState } from "react";
import { createPost, imageSaveFromContents } from "../api/posts.js";
import CustomEditor from "../components/CustomEditor.tsx"
import './WritePost.css';
import { useParams } from "react-router-dom";
import UpdateSidebarComp from "../components/UpdateSidebar..jsx";

const UpdatePost = () => {
  // url에 id값 존재 여부 확인
  const { id } = useParams();

  // 게시글 컴포넌트 데이터
  const [content, setContent] = useState("");
  const [inputs, setInputs] = useState({
    title: "",
    subtitle: "",
    author: "idea de mis dedos",
    slug: "",
    content: "",
  });
  const [sidebarInputs, setSidebarInputs] = useState({
    categoryId: 1,
    subcategoryId: 0,
    isPublished: true,
    isPinned: false,
    tags: ''
  });


  const { title, subtitle, author, slug } = inputs;
  // 게시글 데이터 수집 핸들러
  const inputHandlerChange = (e) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };
  // 게시글 등록
  const clickPostbtn = async (data) => {

    if (inputs['title'] === "") {
      alert('제목을 입력해주세요.');
      return
    } else if (inputs['slug'] === "") {
      alert('슬러그를 입력해주세요.');
      return
    }

    const { finalContent, thumbnailUrl, imgUrlArray, imgOldPathArray } = await imageSaveFromContents(inputs['content']);

    const postDataToSend = {
      'title': inputs.title,
      'subtitle': inputs.subtitle.length > 0 ? inputs.subtitle : null,
      'author': inputs.author,
      'slug': inputs.slug,
      'content': finalContent,
      'thumbnail': thumbnailUrl,
      'category': data.category,
      'subcategory': data.subcategory,
      'isPublished': data.isPublished ? 1 : 0,
      'tags': data.tags,
      'isPinned': data.isPinned ? 1 : 0,
      'tempImgPath': imgOldPathArray 
    }

    try {
      const response = await createPost(postDataToSend);
      console.log('게시글 등록 성공: ', response);
      alert(response.message);
      setInputs({
        title: "",
        subtitle: "",
        author: "idea de mis dedos",
        slug: "",
        content: "",
      });
      setContent("");

    } catch (error) {
      console.error('게시글 등록 실패: ', error);
      alert('게시글 등록에 실패했습니다.');
    }
  };
  // 게시글 수정 시 인풋 객체에 콘텐츠 담기기
  useEffect(() => {
    // console.log(content);
    setInputs({
      ...inputs,
      ['content']: content,
    });
    // console.log(inputs);
  }, [content]);



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
        <CustomEditor setContent={setContent} content = {content} />
      </div>
      <UpdateSidebarComp clickPostbtn={clickPostbtn} />
    </div>
  )
}

export default UpdatePost;