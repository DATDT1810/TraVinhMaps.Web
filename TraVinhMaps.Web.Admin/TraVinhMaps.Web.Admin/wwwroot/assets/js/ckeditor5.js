ClassicEditor.create(document.querySelector("#Description"), {
  toolbar: {
    items: [
      "heading",
      "|",
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "link",
      "|",
      "alignment",
      "|",
      "fontColor",
      "fontBackgroundColor",
      "|",
      "bulletedList",
      "numberedList",
      "blockQuote",
      "|",
      "insertTable",
      "imageUpload",
      "codeBlock",
      "|",
      "undo",
      "redo",
    ],
  },
  alignment: {
    options: ["left", "center", "right", "justify"] 
  },
  height: 300,
}).catch((error) => {
  console.error(error);
});
