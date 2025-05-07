import React, { useState, useMemo } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import { ImageResize } from 'quill-image-resize-module-ts';
import 'react-quill-new/dist/quill.snow.css';

Quill.register('modules/ImageResize', ImageResize);

const CustomEditor = () => {

  const [content, setContent] = useState('');

  const modules = useMemo(() => {
    return {
      toolbar: [
        [{ 'header': [1, 2, 3, 4, false] }, { 'font': [] }, { 'size': [] }],
        [{ align: '' }, { align: 'center' }, { align: 'right' }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image'], ['clean']
      ],
      ImageResize: {
        modules: ['Resize', 'DisplaySize']
      }
    }
  }, []);

  const formats = [
    'header', 'font', 'size', 'align',
    'list', 'bullet', 'check',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'link', 'image', 'color', 'background', 'clean'
    ];

  const handleEditorChange = (value) => {
    setContent(value); // 상태 업데이트
  };

  return (
    <div>
      <div>
        <label>
          제목<input type='text' /><br />
        </label>
        <label>
          부제목<input type='text' /><br />
        </label>
        <label>
          작성자<input type='text' /><br />
        </label>
        <label>
          슬러그<input type='text' /><br />
        </label>
      </div>
      <div>
        <ReactQuill theme="snow" modules={modules} formats={formats}
          style={{ height: "60vh", width: "100%", maxheight: "70vh" }}
          onChange={handleEditorChange} />
      </div>
    </div>
  );
}

export default CustomEditor;