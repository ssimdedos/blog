import { useEffect, useState } from "react";
import { createSubcategory, deleteCategory, deleteSubcategory, editCategoryName, fetchCategory, fetchSubcategory } from "../api/category";
import './CategoryEdit.css';

const CategoryEdit = () => {
  const [categoryList, setCategoryList] = useState({});
  const [subcategoryList, setSubcategoryList] = useState({});
  const [clickedCategory, setClickedCategory] = useState({
    id: "",
    name: "",
  });
  const [modifiedCategory, setModifiedCategory] = useState({
    id: "",
    name: "",
  });
  const [newSubcategory, setNewSubcategory] = useState('');

  useEffect(() => {
    fetchCategory().then((data) => {
      setCategoryList(data);
    });
  }, []);

  const categoryClick = (e) => {
    // console.log(e.currentTarget.querySelector('span').innerText);
    let content = e.currentTarget.querySelector('span').innerText;
    const { id } = e.currentTarget;
    setClickedCategory({
      ['id']: id,
      ['name']: content
    });
    setModifiedCategory({
      ['id']: id,
      ['name']: content
    });

    fetchSubcategory(id).then((data) => {
      setSubcategoryList(data);
    });

  };


  const subcategoryInputHandler = (e) => {
    // console.log(e.target.value);
    setNewSubcategory(e.target.value);
  };

  const addSubcategory = () => {
    const data = { 'name': newSubcategory, 'category_id': clickedCategory.id }
    // console.log(data);
    createSubcategory(data).then((res) => {
      fetchSubcategory(clickedCategory.id).then((data) => {
        setSubcategoryList(data);
      });
      alert(res.msg);
      setNewSubcategory('');
    });
  };

  const subcategoryDeleteHandler = (e) => {
    if (window.confirm('삭제하시겠습니까?')) {
      // console.log(e.target.dataset.id);
      const id = e.target.dataset.id;
      deleteSubcategory(id).then((res) => {
        fetchSubcategory(clickedCategory.id).then((data) => {
          setSubcategoryList(data);
        });
        alert(res.msg);
      });
    } else return;
  };

  const categoryDeleteHandler = (e) => {
    if (window.confirm('삭제하시겠습니까?')) {
      // console.log(e.target.dataset.id);
      const id = e.target.dataset.id;
      deleteCategory(id).then((res) => {
        fetchCategory().then((data) => {
          setCategoryList(data);
        });
        alert(res.msg);
      });
    } else return;
  };

  const editCategoryHandler = () => {
    editCategoryName(modifiedCategory).then((res) => {
      fetchCategory().then((data) => {
        setCategoryList(data);
      });
      alert(res.msg);
    });
  }

  return (
    <div>
      <h3>카테고리 편집</h3>
      <div className="category-table">
        <div>
          <h4>카테고리</h4>
          <button>카테고리 추가</button>
          {categoryList.length != undefined ? categoryList.map((e, i) => (<ul className="cate-ul" value={e.name} key={'cate_id_' + e.id} onClick={categoryClick} id={e.id} ><span className="cate-input">{e.name}</span><span style={{ float: "right" }} onClick={categoryDeleteHandler} data-id={e.id} >❌</span></ul>)) : <ul>로딩 중</ul>}
          <ul className="cate-ul"><input type="text" className="cate-input" /></ul>
        </div>
        <div>
          <h4>카테고리명</h4>
          <input type="text" value={modifiedCategory.name} onChange={(e) => { setModifiedCategory({...modifiedCategory, name:e.target.value}) }} /> <button onClick={editCategoryHandler} >변경</button>
          <br /><span>서브카테고리</span>
          {subcategoryList.length != undefined ? subcategoryList.map((e, i) => (<ul className="cate-ul" value={e.name} key={'subcate_id_' + e.id}><span className="cate-input" id={e.id}>{e.name}</span><span style={{ float: "right" }} onClick={subcategoryDeleteHandler} data-id={e.id} >❌</span></ul>)) : <ul></ul>}
          {subcategoryList.length != undefined ? <ul className="cate-ul cate-add-ul"><input type="text" onChange={subcategoryInputHandler} value={newSubcategory} className="cate-input" /><button className="subcate-add-btn" onClick={addSubcategory} >추가</button></ul> : <ul></ul>}
        </div>
      </div>
    </div>
  )
};

export default CategoryEdit;