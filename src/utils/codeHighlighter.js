// Shiki syntax highlighting wrapper
import { createHighlighter } from 'shiki';

let highlighter = null;
let initPromise = null;

// Common languages to load
const languages = [
    'javascript',
    'typescript',
    'python',
    'css',
    'html',
    'bash',
    'json',
    'js',
    'ts',
    'jsx',
    'tsx',
    'java',
    'c',
    'cpp',
    'go',
    'rust',
    'php',
    'ruby',
    'sql',
    'yaml',
    'xml',
    'markdown',
    'md'
];

// Initialize the highlighter
async function initialize() {
    if (highlighter) {
        return highlighter;
    }

    if (initPromise) {
        return initPromise;
    }

    initPromise = (async () => {
        try {
            highlighter = await createHighlighter({
                themes: ['github-light'],
                langs: languages
            });
            return highlighter;
        } catch (error) {
            console.error('Failed to initialize Shiki:', error);
            initPromise = null;
            return null;
        }
    })();

    return initPromise;
}

// Highlight code with syntax highlighting
async function highlightCode(code, language = 'text') {
    try {
        // Initialize if not already done
        const hl = await initialize();

        if (!hl) {
            // Fallback: return escaped HTML if highlighter failed
            return escapeHtml(code);
        }

        // Normalize language name
        const normalizedLang = normalizeLanguage(language);

        // Check if language is supported
        if (hl.getLoadedLanguages().includes(normalizedLang)) {
            const html = hl.codeToHtml(code, {
                lang: normalizedLang,
                theme: 'github-light'
            });

            // Remove the pre/code wrapper that Shiki adds
            // We just want the inner HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const codeElement = tempDiv.querySelector('code');
            return codeElement ? codeElement.innerHTML : escapeHtml(code);
        } else {
            // Language not supported, return plain text
            return escapeHtml(code);
        }
    } catch (error) {
        console.error('Syntax highlighting error:', error);
        return escapeHtml(code);
    }
}

// Normalize language names
function normalizeLanguage(lang) {
    if (!lang) return 'text';

    const langMap = {
        'js': 'javascript',
        'ts': 'typescript',
        'jsx': 'javascript',
        'tsx': 'typescript',
        'py': 'python',
        'sh': 'bash',
        'shell': 'bash',
        'yml': 'yaml',
        'md': 'markdown',
        'c++': 'cpp',
        'cs': 'csharp'
    };

    const normalized = lang.toLowerCase();
    return langMap[normalized] || normalized;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export functions
export { initialize, highlightCode };
