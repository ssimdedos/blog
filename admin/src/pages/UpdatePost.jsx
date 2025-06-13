import { useEffect, useState } from "react";
import { fetchPostForUpdate, imageSaveFromContents, updatePost } from "../api/posts.js";
import CustomEditor from "../components/CustomEditor.tsx"
import './WritePost.css';
import { useParams } from "react-router-dom";
import UpdateSidebarComp from "../components/UpdateSidebar..jsx";

const UpdatePost = () => {
  const [loading, setLoading] = useState(true);
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
    categoryId: null,
    subcategoryId: null,
    isPublished: true,
    isPinned: false,
    tags: ''
  });

  const getPost = async () => {
    setLoading(true);
    try {
      const res = await fetchPostForUpdate(id);
      const { title, sub_title, author, slug, content, category_id, sub_category_id, is_pinned, is_published, tags } = res;
      let tagString = tags.join(', ');
      setInputs({
        title,
        subtitle: sub_title === null ? '' : sub_title,
        author,
        slug,
        content
      });
      setSidebarInputs({
        categoryId: category_id,
        subcategoryId: sub_category_id,
        isPublished: is_published,
        isPinned: is_pinned,
        tags: tagString
      });
      setContent(content);
      // console.log(res);
    } catch (err) {
      console.error('데이터 로딩 오류', err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    getPost();
  }, []);


  const { title, subtitle, author, slug } = inputs;
  // 게시글 데이터 수집 핸들러
  const inputHandlerChange = (e) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };
  // 게시글 수정
  const clickPostbtn = async (data) => {

    if (inputs['title'] === "") {
      alert('제목을 입력해주세요.');
      return
    } else if (inputs['slug'] === "") {
      alert('슬러그를 입력해주세요.');
      return
    }

    const { finalContent, thumbnailUrl, imgUrlArray, imgOldPathArray } = await imageSaveFromContents(inputs['content']);
    // console.log(data);
    const postDataToSend = {
      'title': inputs.title,
      'sub_title': inputs.subtitle.length > 0 ? inputs.subtitle : null,
      'author': inputs.author,
      'slug': inputs.slug,
      'content': finalContent,
      'thumbnail': thumbnailUrl ? thumbnailUrl : null,
      'category_id': data.category,
      'sub_category_id': data.subcategory,
      'is_published': data.isPublished ? 1 : 0,
      'is_pinned': data.isPinned ? 1 : 0,
      'tags': data.tags,
      'tempImgPath': imgOldPathArray ? imgOldPathArray : null
    }

    try {
      const response = await updatePost(id, postDataToSend);
      console.log('게시글 업데이트 성공: ', response);
      alert(response.msg);
      window.location.reload();
    } catch (error) {
      console.error('게시글 업데이트 실패: ', error);
      alert('게시글 업데이트에 실패했습니다.');
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

  if (loading) {
    return <div className="loading-message">데이터 로딩 중...</div>;
  }

  if (!sidebarInputs) {
    return <div className="no-data-message">해당 게시글 데이터를 불러을 수 없습니다.</div>;
  }

  return (
    <div className="write-container">
      <div>
        <h2>게시글 수정</h2>
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
        <div className="editor-box" >
          <CustomEditor setContent={setContent} content={content} />
        </div>
      </div>
      <UpdateSidebarComp clickPostbtn={clickPostbtn} sidebarInputs={sidebarInputs} />
    </div>
  )
}

export default UpdatePost;