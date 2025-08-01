document.addEventListener('DOMContentLoaded', function () {
    const editors = document.querySelectorAll('.wysiwyg-editor');
    editors.forEach(editorEl => {
        ClassicEditor.create(editorEl, {
            toolbar: {
                items: [
                    'heading',
                    '|',
                    'bold',
                    'italic',
                    'bulletedList',
                    'numberedList',
                    '|',
                    'blockQuote',
                    'undo',
                    'redo'
                ]
            },
            table: {
                toolbar: []
            },
            removePlugins: ['Table', 'TableToolbar'],
            language: 'en',
        }).then(editor => {
            const editableElement = editor.ui.getEditableElement();
            const enforceMinHeight = () => {
                const currentHeight = editableElement.offsetHeight;
                if (currentHeight < 120) {
                    editableElement.style.minHeight = '120px';
                }
            };

            enforceMinHeight();

            const observer = new MutationObserver(() => {
                enforceMinHeight();
            });

            observer.observe(editableElement, {
                attributes: true,
                attributeFilter: ['style', 'class'],
                subtree: true
            });

            ['focus', 'blur', 'input', 'keyup', 'mouseup', 'click'].forEach(event => {
                editableElement.addEventListener(event, enforceMinHeight);
            });

            editor.model.document.on('change:data', enforceMinHeight);

            setTimeout(() => {
                const unwantedElements = editor.ui.view.element.querySelectorAll(
                    '[data-cke-tooltip-text*="indent"], [data-cke-tooltip-text*="Increase"]'
                );
                unwantedElements.forEach(el => el.remove());
            }, 100);
        }).catch((error) => {
            console.error('Error initializing CKEditor:', error);
        });
    });
});
