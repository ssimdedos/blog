import React, { useMemo } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import { ImageResize } from 'quill-image-resize-module-ts';
import QuillTableBetter from 'quill-table-better';
import 'react-quill-new/dist/quill.snow.css';
import "quill-table-better/dist/quill-table-better.css";

// Quill.register('modules/ImageResize', ImageResize);
Quill.register({ 'modules/table-better': QuillTableBetter, 'modules/ImageResize': ImageResize }, true);

const CustomEditor = ({ setContent, content }) => {

  const handleEditorChange = (value) => {
    setContent(value);
  }

  const modules = useMemo(() => {
    return {
      table: false,
      toolbar: [
        [{ 'header': [1, 2, 3, 4, false] }, { 'font': [] }, { 'size': [] }],
        [{ align: '' }, { align: 'center' }, { align: 'right' }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        ['table-better'], ['link', 'image'], ['clean']
      ],
      ImageResize: {
        modules: ['Resize', 'DisplaySize']
      },
      'table-better': {
        language: "en_US",
        menus: [
          "column",
          "row",
          "merge",
          "table",
          "cell",
          "wrap",
          "copy",
          "delete",
        ],
        toolbarButtons: {
          whiteList: ['link', 'image'],
          singleWhiteList: ['link', 'image']
        },
        toolbarTable: true,
      },
      keyboard: {
        bindings: QuillTableBetter.keyboardBindings,
      },
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
          style={{ height: "49vh", width: "95%" }}
          onChange={handleEditorChange}
          value={content} />
      </div>
    </div>
  );
}

export default CustomEditor;