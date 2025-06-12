// CKEDITOR5
$(document).ready(function () {
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
    height: 300,
  }).catch((error) => {
    console.error(error);
  });
});
