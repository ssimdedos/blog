import { useMemo } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import QuillTableBetter from "quill-table-better";
import { ImageResize } from 'quill-image-resize-module-ts';
import "react-quill-new/dist/quill.snow.css";
import "quill-table-better/dist/quill-table-better.css";
import "./CustomEditor.css";

Quill.register({ 'modules/table-better': QuillTableBetter, 'modules/ImageResize': ImageResize }, true);

const CustomEditor = ({setContent, content}) => {

  const handleEditorChange = (value) => {
    setContent(value);
  }

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ 'header': [1, 2, 3, 4, false] }, { 'font': [] }, { 'size': [] }],
          [{ align: '' }, { align: 'center' }, { align: 'right' }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
          ["bold", "italic", "underline", "strike"],
          [{ 'color': [] }, { 'background': [] }],
          ["link", "image"],
          ["table-better"],
        ],
      },
      table: false,
      "table-better": {
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
        toolbarTable: true,
      },
      keyboard: {
        bindings: QuillTableBetter.keyboardBindings,
      },
      ImageResize: {
        modules: ['Resize', 'DisplaySize']
      },
    }),
    []
  );

    const formats = [
    'header', 'font', 'size', 'align',
    'list',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'link', 'image', 'color', 'background',
    'table'
  ];

  return (
    <div className='write-container'>
        <ReactQuill theme="snow" modules={modules}
          formats={formats}
          onChange={handleEditorChange}
          value={content} />
    </div>
  );
};

export default CustomEditor;
