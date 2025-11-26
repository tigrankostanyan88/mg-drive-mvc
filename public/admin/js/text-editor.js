const TOOLBAR_CONFIG = [{
    cmd: 'bold',
    icon: 'fas fa-bold',
    title: 'Жирный',
    class: 'btn-dark',
    group: 'format'
  },
  {
    cmd: 'italic',
    icon: 'fas fa-italic',
    title: 'Курсив',
    class: 'btn-dark',
    group: 'format'
  },
  {
    cmd: 'underline',
    icon: 'fas fa-underline',
    title: 'Подчеркнутый',
    class: 'btn-dark',
    group: 'format'
  },
  {
    cmd: 'insertUnorderedList',
    icon: 'fas fa-list-ul',
    title: 'Маркированный список',
    class: 'btn-primary',
    group: 'list'
  },
  {
    cmd: 'insertOrderedList',
    icon: 'fas fa-list-ol',
    title: 'Нумерованный список',
    class: 'btn-primary',
    group: 'list'
  },
  {
    cmd: 'createLink',
    icon: 'fas fa-link',
    title: 'Ссылка',
    class: 'btn-success',
    group: 'link'
  }
];


function initWysiwyg(container) {
  if (!container) return console.error('❌ Контейнер не найден:', container);

  const editor = container.querySelector('.editor-area');
  const hiddenField = container.querySelector('textarea[name]');


  // создаём toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'card-header d-flex flex-wrap p-2 border-bottom mb-2';
  container.prepend(toolbar);

  let currentGroup = '';
  TOOLBAR_CONFIG.forEach(item => {
    // Добавляем разделитель между группами
    if (item.group !== currentGroup && currentGroup !== '') {
      const sep = document.createElement('span');
      sep.className = 'vr mx-2 bg-secondary';
      toolbar.appendChild(sep);
    }
    currentGroup = item.group;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btn btn-sm ${item.class} me-2 mb-1`;
    btn.title = item.title;
    btn.innerHTML = `<i class="${item.icon}"></i>`;

    btn.addEventListener('click', () => {
      editor.focus();
      if (item.cmd === 'createLink') {
        const url = prompt('Введите URL ссылки:', 'https://');
        if (url) document.execCommand('createLink', false, url);
      } else {
        document.execCommand(item.cmd, false, null);
      }
    });
    toolbar.appendChild(btn);
  });

  // обработка изменений — сохраняем чистый HTML в hidden textarea
  editor.addEventListener('input', () => {
    const cleaned = cleanHTML(editor.innerHTML);
    hiddenField.value = cleaned;
  });

  // обработка вставки текста — только чистый текст без форматирования
  editor.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  });

  hiddenField.value = cleanHTML(editor.innerHTML);
}

function cleanHTML(html) {
  const div = document.createElement('div');
  div.innerHTML = html;

  let result = '';
  Array.from(div.childNodes).forEach(node => {
    if (node.nodeType === 3) { // text node
      const text = node.textContent.trim();
      if (text) result += `<p>${text}</p>`;
    } else if (node.nodeType === 1) { // element node
      const tag = node.tagName.toLowerCase();
      if (['ul', 'ol', 'blockquote', 'h2', 'h2', 'h3', 'h4', 'p'].includes(tag)) {
        result += node.outerHTML;
      } else {
        const text = node.innerText.trim().replace(/\s{2,}/g, ' ');
        if (text) result += `<p>${text}</p>`;
      }
    }
  });
  return result.trim();
}

document.addEventListener('DOMContentLoaded', () => {
  let editorContainers = document.querySelectorAll('#editor-container');
  editorContainers.forEach(item => {
    initWysiwyg(item);
  });
});
