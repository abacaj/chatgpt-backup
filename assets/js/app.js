// ==========================================
// SIMPLE MARKDOWN PARSER
// ==========================================

function parseMarkdown(text) {
    if (!text || typeof text !== 'string') return '';

    // Get current theme for dynamic icon selection
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';

    // Dynamic icon paths based on theme
    const assistantIcon = isDarkTheme ? '/assets/images/OpenAI-white-monoblossom.svg' : '/assets/images/OpenAI-black-monoblossom.svg';
    const userIcon = isDarkTheme ? '/assets/images/chat_user_white.svg' : '/assets/images/chat_user_black.svg';

    // Convert markdown to HTML
    let html = text
        // Headers with dynamic icons (multiple patterns for Assistant and User)
        .replace(/^## !\[Assistente\]\([^)]*\s+"[^"]*"\)\s*$/gim, `<h2><img src="${assistantIcon}" alt="Assistente" width="24" height="24"> Assistente</h2>`)
        .replace(/^## !\[Assistant\]\([^)]*\s+"[^"]*"\)\s*$/gim, `<h2><img src="${assistantIcon}" alt="Assistant" width="24" height="24"> Assistant</h2>`)
        .replace(/^## !\[Usuário\]\([^)]*\s+"[^"]*"\)\s*$/gim, `<h2><img src="${userIcon}" alt="Usuário" width="24" height="24"> Usuário</h2>`)
        .replace(/^## !\[User\]\([^)]*\s+"[^"]*"\)\s*$/gim, `<h2><img src="${userIcon}" alt="User" width="24" height="24"> User</h2>`)

        // Also handle variations without quotes in title
        .replace(/^## !\[Assistente\]\([^)]*\)\s*$/gim, `<h2><img src="${assistantIcon}" alt="Assistente" width="24" height="24"> Assistente</h2>`)
        .replace(/^## !\[Assistant\]\([^)]*\)\s*$/gim, `<h2><img src="${assistantIcon}" alt="Assistant" width="24" height="24"> Assistant</h2>`)
        .replace(/^## !\[Usuário\]\([^)]*\)\s*$/gim, `<h2><img src="${userIcon}" alt="Usuário" width="24" height="24"> Usuário</h2>`)
        .replace(/^## !\[User\]\([^)]*\)\s*$/gim, `<h2><img src="${userIcon}" alt="User" width="24" height="24"> User</h2>`)

        // Regular headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')

        // Bold and italic
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')

        // Code blocks (triple backticks) with language support
        .replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang ? ` class="language-${lang}"` : '';
            return `<pre><code${language}>${code.trim()}</code></pre>`;
        })

        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')

        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')

        // Lists
        .replace(/^\* (.+)$/gim, '<li>$1</li>')
        .replace(/^- (.+)$/gim, '<li>$1</li>')

        // Blockquotes
        .replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>')

        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    // Wrap lists properly
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    html = html.replace(/<\/ul><br><ul>/g, '');

    // Wrap in paragraphs
    html = `<p>${html}</p>`
        .replace(/<p><\/p>/g, '')
        .replace(/<p>(<h[1-6]>)/g, '$1')
        .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
        .replace(/<p>(<pre>)/g, '$1')
        .replace(/(<\/pre>)<\/p>/g, '$1')
        .replace(/<p>(<ul>)/g, '$1')
        .replace(/(<\/ul>)<\/p>/g, '$1')
        .replace(/<p>(<blockquote>)/g, '$1')
        .replace(/(<\/blockquote>)<\/p>/g, '$1');

    return html;
}// ==========================================
// INTERNATIONALIZATION SYSTEM
// ==========================================

const translations = {
    'en': {
        'title': 'Chat\'s Backup X Viewer',
        'lang_auto': 'Auto-detect',
        'lang_en': 'English',
        'lang_pt_br': 'Português (BR)',
        'select_file': 'Select the ChatGPT backup JSON file',
        'select_conversation': 'Select a conversation to view the preview',
        'error_invalid_file': 'Error: Please select a valid JSON file.',
        'success_loaded': 'Success: {count} conversation(s) loaded.',
        'error_invalid_json': 'Error: Invalid JSON file - {error}',
        'error_unrecognized_format': 'Error: Unrecognized data format.',
        'error_no_messages': 'Error: Conversation without messages.',
        'untitled_conversation': 'Untitled conversation',
        'unknown_date': 'Unknown date',
        'download_md': 'Download MD',
        'user': 'User',
        'assistant': 'Assistant',
        'conversation': 'conversation',
        'chatgpt_conversation': 'ChatGPT Conversation',
        'messages_count': '{count} messages',
        'data_loaded_from_cache': 'Data loaded from local cache.',
        'select_conversation_help': 'Choose a conversation from the sidebar to see its content here.',
        'switch_to_light': 'Switch to light theme',
        'switch_to_dark': 'Switch to dark theme',
        'toggle_markdown': 'Toggle raw markdown view',
        'edit_mode': 'Edit Mode',
        'view_mode': 'View Mode',
        'copy_content': 'Copy content to clipboard',
        'content_copied': 'Content copied to clipboard!'
    },
    'pt-br': {
        'title': 'Chat\'s Backup X Viewer',
        'lang_auto': 'Auto-detectar',
        'lang_en': 'English',
        'lang_pt_br': 'Português (BR)',
        'select_file': 'Selecione o arquivo JSON do backup do ChatGPT',
        'select_conversation': 'Selecione uma conversa para visualizar o preview',
        'error_invalid_file': 'Erro: Por favor selecione um arquivo JSON válido.',
        'success_loaded': 'Sucesso: {count} conversa(s) carregada(s).',
        'error_invalid_json': 'Erro: Arquivo JSON inválido - {error}',
        'error_unrecognized_format': 'Erro: Formato de dados não reconhecido.',
        'error_no_messages': 'Erro: Conversa sem mensagens.',
        'untitled_conversation': 'Conversa sem título',
        'unknown_date': 'Data desconhecida',
        'download_md': 'Download MD',
        'user': 'Usuário',
        'assistant': 'Assistente',
        'conversation': 'conversa',
        'chatgpt_conversation': 'Conversa ChatGPT',
        'messages_count': '{count} mensagens',
        'data_loaded_from_cache': 'Dados carregados do cache local.',
        'select_conversation_help': 'Escolha uma conversa na barra lateral para ver seu conteúdo aqui.',
        'switch_to_light': 'Mudar para tema claro',
        'switch_to_dark': 'Mudar para tema escuro',
        'toggle_markdown': 'Alternar visualização markdown raw',
        'edit_mode': 'Modo Edição',
        'view_mode': 'Modo Visualização',
        'copy_content': 'Copiar conteúdo para área de transferência',
        'content_copied': 'Conteúdo copiado para área de transferência!'
    }
};

let currentLanguage = 'en'; // Default fallback
let currentTheme = 'light'; // Default theme

// ==========================================
// THEME SYSTEM
// ==========================================

function detectTheme() {
    const saved = localStorage.getItem('chatgpt_backup_theme');
    if (saved) return saved;

    // Auto-detect based on system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

function setTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('chatgpt_backup_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    // Update theme toggle icons
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    if (theme === 'dark') {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }

    // Update logo dynamically
    updateLogo(theme);

    // Re-render current chat to update dynamic icons
    if (currentChat) {
        renderMessages(currentChat, isMarkdownMode);
    }
}

function updateLogo(theme) {
    const logoImage = document.querySelector('.logo-image');
    if (logoImage) {
        const logoSrc = theme === 'dark'
            ? '/assets/images/OpenAI-white-monoblossom.svg'
            : '/assets/images/OpenAI-black-monoblossom.svg';
        logoImage.src = logoSrc;
    }
}

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function detectLanguage() {
    const saved = localStorage.getItem('chatgpt_backup_language');
    if (saved && saved !== 'auto') return saved;

    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('pt')) return 'pt-br';
    return 'en';
}

function translate(key, params = {}) {
    const translation = translations[currentLanguage]?.[key] || translations['en'][key] || key;
    return translation.replace(/\{(\w+)\}/g, (match, param) => params[param] || match);
}

function updatePageLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (element.tagName === 'TITLE') {
            element.textContent = translate(key);
        } else {
            element.textContent = translate(key);
        }
    });

    // Update titles for elements with data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        element.title = translate(key);
    });

    // Update dynamic content if loaded
    if (currentData) {
        displayChats(currentData);
    }
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('chatgpt_backup_language', lang);
    updatePageLanguage();
}

// ==========================================
// APPLICATION LOGIC
// ==========================================
// Estado da aplicação
let currentData = null;
let selectedChat = null;

// Elementos DOM
const fileInput = document.getElementById('fileInput');
const statusDiv = document.getElementById('status');
const chatsList = document.getElementById('chatsList');
const previewDiv = document.getElementById('preview');

// Event listeners
fileInput.addEventListener('change', handleFileLoad);

function handleFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
        showStatus(translate('error_invalid_file'), 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const jsonData = JSON.parse(e.target.result);
            currentData = jsonData;
            displayChats(jsonData);
            const count = Array.isArray(jsonData) ? jsonData.length : '1';
            showStatus(translate('success_loaded', { count }), 'success');

            // Salvar no localStorage
            localStorage.setItem('chatgpt_backup_data', JSON.stringify(jsonData));
        } catch (error) {
            showStatus(translate('error_invalid_json', { error: error.message }), 'error');
            console.error('Erro ao parsear JSON:', error);
        }
    };
    reader.readAsText(file);
}

function showStatus(message, type) {
    statusDiv.innerHTML = `<div class="${type}">${message}</div>`;
    setTimeout(() => {
        statusDiv.innerHTML = '';
    }, 5000);
}

function displayChats(data) {
    chatsList.innerHTML = '';

    // Se é um array de conversas (backup completo)
    if (Array.isArray(data)) {
        data.forEach((chat, index) => {
            const chatItem = createChatItem(chat, index);
            chatsList.appendChild(chatItem);
        });
    }
    // Se é uma única conversa
    else if (data.messages) {
        const chatItem = createChatItem(data, 0);
        chatsList.appendChild(chatItem);
    }
    else {
        showStatus(translate('error_unrecognized_format'), 'error');
    }
}

function createChatItem(chat, index) {
    const div = document.createElement('div');
    div.className = 'chat-item';
    div.dataset.index = index;

    const title = chat.title || translate('untitled_conversation');
    const messageCount = chat.messages ? chat.messages.length : 0;
    const createTime = chat.create_time ? new Date(chat.create_time * 1000).toLocaleString() : translate('unknown_date');

    div.innerHTML = `
            <div class="chat-title">${escapeHtml(title)}</div>
            <div class="chat-info">
                ${translate('messages_count', { count: messageCount })} - ${createTime}
                <button class="download-btn" onclick="downloadChat(${index})">${translate('download_md')}</button>
            </div>
        `;

    div.addEventListener('click', (e) => {
        if (!e.target.classList.contains('download-btn')) {
            selectChat(index);
        }
    });

    return div;
}

function selectChat(index) {
    // Remove seleção anterior
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('selected');
    });

    // Adiciona seleção atual
    const selectedItem = document.querySelector(`[data-index="${index}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
    }

    // Mostra preview
    const chat = Array.isArray(currentData) ? currentData[index] : currentData;
    selectedChat = chat;
    showPreview(chat);
}

let currentChat = null;
let isMarkdownMode = false;

function showPreview(chat) {
    const previewContent = document.getElementById('preview');
    const previewHeader = document.querySelector('.preview-header h2');

    currentChat = chat; // Store current chat for toggle functionality

    if (!chat || !chat.messages) {
        previewContent.innerHTML = `<p>${translate('error_no_messages')}</p>`;
        previewHeader.textContent = translate('select_conversation');
        return;
    }

    // Update header
    previewHeader.textContent = chat.title || translate('untitled_conversation');

    renderMessages(chat, isMarkdownMode);
}

function renderMessages(chat, rawMode = false) {
    const previewContent = document.getElementById('preview');

    if (rawMode) {
        // Edit mode - show markdown source in editable textarea
        let markdown = '';
        chat.messages.forEach(message => {
            if (message.role === 'user' || message.role === 'assistant') {
                const content = Array.isArray(message.content) ? message.content[0] : message.content;
                if (content) {
                    const roleText = message.role === 'user' ? translate('user') : translate('assistant');
                    // Use proper dynamic icon syntax for markdown
                    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
                    const iconPath = message.role === 'user'
                        ? (isDarkTheme ? '/assets/images/chat_user_white.svg' : '/assets/images/chat_user_black.svg')
                        : (isDarkTheme ? '/assets/images/OpenAI-white-monoblossom.svg' : '/assets/images/OpenAI-black-monoblossom.svg');

                    markdown += `## ![${roleText}](${iconPath} "${roleText}")\n\n${content}\n\n---\n\n`;
                }
            }
        });

        previewContent.innerHTML = `
      <div class="markdown-editor">
        <div class="editor-header">
          <h3>${translate('edit_mode')}</h3>
          <span class="editor-info">Markdown Source</span>
        </div>
        <textarea 
          class="markdown-source" 
          spellcheck="false"
          placeholder="Markdown content..."
        >${markdown}</textarea>
      </div>
    `;
    } else {
        // View mode - show rendered HTML
        let html = '';

        chat.messages.forEach(message => {
            if (message.role === 'user' || message.role === 'assistant') {
                const content = Array.isArray(message.content) ? message.content[0] : message.content;
                if (content) {
                    // Get dynamic icons based on current theme
                    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
                    const userIcon = message.role === 'user'
                        ? `<img src="${isDarkTheme ? '/assets/images/chat_user_white.svg' : '/assets/images/chat_user_black.svg'}" width="20" height="20" alt="User">`
                        : `<img src="${isDarkTheme ? '/assets/images/OpenAI-white-monoblossom.svg' : '/assets/images/OpenAI-black-monoblossom.svg'}" width="20" height="20" alt="Assistant">`;

                    const processedContent = parseMarkdown(content);
                    const roleClass = message.role === 'user' ? 'user' : 'assistant';
                    const roleText = message.role === 'user' ? translate('user') : translate('assistant');

                    html += `
            <div class="message ${roleClass}">
              <div class="message-header">
                <div class="message-icon">
                  ${userIcon}
                </div>
                <h3 class="message-role">${roleText}</h3>
              </div>
              <div class="message-content markdown-content">${processedContent}</div>
            </div>
          `;
                }
            }
        });

        previewContent.innerHTML = `
      <div class="markdown-viewer">
        <div class="viewer-header">
          <h3>${translate('view_mode')}</h3>
          <span class="viewer-info">Rendered Content</span>
        </div>
        <div class="conversation-content">
          ${html}
        </div>
      </div>
    `;
    }
}

function downloadChat(index) {
    const chat = Array.isArray(currentData) ? currentData[index] : currentData;
    if (!chat) return;

    const title = (chat.title || translate('conversation')).replace(/[^a-z0-9]/gi, '_');
    let markdown = `# ${chat.title || translate('chatgpt_conversation')}\n\n`;

    if (chat.messages) {
        chat.messages.forEach(message => {
            if (message.role === 'user' || message.role === 'assistant') {
                const content = Array.isArray(message.content) ? message.content[0] : message.content;
                if (content) {
                    markdown += `## ${message.role === 'user' ? translate('user') : translate('assistant')}\n\n${content}\n\n---\n\n`;
                }
            }
        });
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.md`;
    link.click();
    URL.revokeObjectURL(url);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Carregar dados salvos no localStorage
window.addEventListener('load', () => {
    // Initialize language
    currentLanguage = detectLanguage();
    document.getElementById('languageSelector').value = localStorage.getItem('chatgpt_backup_language') || 'auto';
    updatePageLanguage();

    // Load saved data
    const savedData = localStorage.getItem('chatgpt_backup_data');
    if (savedData) {
        try {
            currentData = JSON.parse(savedData);
            displayChats(currentData);
            showStatus(translate('data_loaded_from_cache'), 'success');
        } catch (error) {
            console.error('Erro ao carregar dados salvos:', error);
        }
    }
});

// Language selector event listener
document.addEventListener('DOMContentLoaded', () => {
    const languageSelector = document.getElementById('languageSelector');
    languageSelector.addEventListener('change', (e) => {
        const selectedLang = e.target.value;
        if (selectedLang === 'auto') {
            localStorage.removeItem('chatgpt_backup_language');
            setLanguage(detectLanguage());
        } else {
            setLanguage(selectedLang);
        }
    });

    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');

    function updateThemeToggle(theme) {
        if (theme === 'dark') {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
            themeToggle.title = translate('switch_to_light');
        } else {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
            themeToggle.title = translate('switch_to_dark');
        }
    }

    // Initialize theme
    const savedTheme = localStorage.getItem('chatgpt_backup_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeToggle(currentTheme);
    updateLogo(currentTheme); // Initialize logo with correct theme

    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('chatgpt_backup_theme', newTheme);
        updateThemeToggle(newTheme);
        updateLogo(newTheme); // Update logo when theme changes

        // Re-render current chat to update dynamic icons
        if (currentChat) {
            renderMessages(currentChat, isMarkdownMode);
        }
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('chatgpt_backup_theme')) {
            const theme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            updateThemeToggle(theme);
            updateLogo(theme); // Update logo when system theme changes

            // Re-render current chat to update dynamic icons
            if (currentChat) {
                renderMessages(currentChat, isMarkdownMode);
            }
        }
    });

    // Preview action buttons
    const toggleMarkdownBtn = document.getElementById('toggleMarkdownBtn');
    const copyContentBtn = document.getElementById('copyContentBtn');

    toggleMarkdownBtn.addEventListener('click', () => {
        if (currentChat) {
            isMarkdownMode = !isMarkdownMode;
            renderMessages(currentChat, isMarkdownMode);

            // Update button tooltip
            toggleMarkdownBtn.title = isMarkdownMode
                ? translate('toggle_markdown') + ' (Raw)'
                : translate('toggle_markdown') + ' (Rendered)';
        }
    });

    copyContentBtn.addEventListener('click', async () => {
        if (currentChat && currentChat.messages) {
            let content = '';
            currentChat.messages.forEach(message => {
                if (message.role === 'user' || message.role === 'assistant') {
                    const messageContent = Array.isArray(message.content) ? message.content[0] : message.content;
                    if (messageContent) {
                        content += `**${message.role === 'user' ? translate('user') : translate('assistant')}:**\n${messageContent}\n\n`;
                    }
                }
            });

            try {
                await navigator.clipboard.writeText(content);
                // Temporary feedback
                const originalTitle = copyContentBtn.title;
                copyContentBtn.title = translate('content_copied');
                setTimeout(() => {
                    copyContentBtn.title = originalTitle;
                }, 2000);
            } catch (err) {
                console.error('Failed to copy content:', err);
            }
        }
    });
});