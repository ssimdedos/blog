import React, { useMemo } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import { ImageResize } from 'quill-image-resize-module-ts';
import 'react-quill-new/dist/quill.snow.css';


Quill.register('modules/ImageResize', ImageResize);

const CustomEditor = ({ setContent, content }) => {

  const handleEditorChange = (value) => {
    setContent(value);
  }

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
    'list',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'link', 'image', 'color', 'background'
    ];

  return (
    <div className='write-container'>
      <div>
        <ReactQuill theme="snow" modules={modules} formats={formats}
          style={{ height: "55vh", width: "95%" }}
          onChange={handleEditorChange}
          value={content} />
      </div>
    </div>
  );
}

export default CustomEditor;