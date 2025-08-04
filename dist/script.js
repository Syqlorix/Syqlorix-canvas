const examples = {
    simple: `<!DOCTYPE html>
<html>
<head>
    <title>Page Title</title>
</head>
<body>
    <h1>This is a Heading</h1>
    <p>This is a paragraph.</p>
</body>
</html>`,
    advanced: `<!DOCTYPE html>
<html>
<head>
    <title>Syqlorix - The Future is Now</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
body {
    background-color: #1a1a2e;
    color: #e0e0e0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
h1 { color: #00a8cc; }
.container { max-width: 800px; margin: auto; padding: 2rem; }
</style>
</head>
<body>
    <div class="container">
        <h1>Welcome to the Next Level</h1>
        <p>This was generated from a full HTML document.</p>
    </div>
    <script>
console.log('Syqlorix page loaded!');
</script>
</body>
</html>`,
    template: `<!DOCTYPE html>
<html>
<head>
    <title>App Template</title>
    <style>
body {
    background-color: #1a1a2e; color: #e0e0e0; font-family: sans-serif;
    display: grid; place-content: center; height: 100vh; margin: 0;
}
.container { text-align: center; max-width: 600px; padding: 2rem; border-radius: 8px; background: #2a2a4a; }
h1 { color: #00a8cc; }
nav a { margin: 0 1rem; color: #72d5ff; }
</style>
</head>
<body>
    <div class="container">
        <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
        </nav>
        <h1>Welcome to the App!</h1>
        <p>This demonstrates a common page layout.</p>
    </div>
</body>
</html>`
};

let htmlEditor, syqlorixEditor;
let previewFrame;
const initialPreviewContent = `<body style="font-family: sans-serif; color: #555; display: grid; place-content: center; height: 100%; margin: 0;"><p>Live preview will appear here.</p></body>`;

require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.34.0/min/vs' }});
require(['vs/editor/editor.main'], () => {
    htmlEditor = monaco.editor.create(document.getElementById('html-input-container'), {
        value: examples.simple,
        language: 'html',
        theme: 'vs-dark',
        automaticLayout: true,
        fontFamily: 'Fira Code',
        wordWrap: 'on',
        minimap: { enabled: false }
    });

    syqlorixEditor = monaco.editor.create(document.getElementById('syqlorix-output-container'), {
        value: '',
        language: 'python',
        theme: 'vs-dark',
        readOnly: true,
        automaticLayout: true,
        fontFamily: 'Fira Code',
        wordWrap: 'on'
    });

    processAll(htmlEditor.getValue());
    htmlEditor.onDidChangeModelContent(() => processAll(htmlEditor.getValue()));
});

document.addEventListener('DOMContentLoaded', () => {
    const previewPanel = document.querySelector('.preview-panel');
    const previewToggle = document.querySelector('.preview-toggle');
    const previewClose = document.querySelector('.preview-close');
    const fullscreenButton = document.getElementById('fullscreen-button');
    const previewModal = document.getElementById('preview-modal');
    const modalCloseButton = document.getElementById('modal-close-button');
    const modalPreviewFrame = document.getElementById('modal-preview-frame');
    const copyButton = document.getElementById('copy-button');
    const downloadButton = document.getElementById('download-button');
    const exampleSelect = document.getElementById('example-select');
    previewFrame = document.getElementById('preview-frame');

    const togglePreview = () => {
        previewPanel.classList.toggle('active');
        previewToggle.classList.toggle('active');
        const icon = previewToggle.querySelector('i');
        icon.className = previewPanel.classList.contains('active') ? 'fas fa-times' : 'fas fa-eye';
    };
    
    previewToggle.addEventListener('click', togglePreview);
    previewClose.addEventListener('click', togglePreview);
    
    copyButton.addEventListener('click', () => {
        const code = syqlorixEditor.getValue();
        if (!code || code.startsWith('# Conversion failed:')) { showStatus('Nothing to copy or conversion failed.', 'error', 3000); return; }
        navigator.clipboard.writeText(code).then(() => {
            const originalIcon = copyButton.innerHTML;
            copyButton.innerHTML = '<i class="fas fa-check mr-1"></i>Copied!';
            copyButton.classList.add('copied');
            showStatus('Code copied to clipboard!', 'success', 2000);
            setTimeout(() => { copyButton.innerHTML = originalIcon; copyButton.classList.remove('copied'); }, 2000);
        }).catch(() => showStatus('Failed to copy to clipboard.', 'error', 3000));
    });

    downloadButton.addEventListener('click', () => {
        const code = syqlorixEditor.getValue();
        if (!code || code.startsWith('# Conversion failed:')) { showStatus('Nothing to download or conversion failed.', 'error', 3000); return; }
        const blob = new Blob([code], { type: 'text/python' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'app.py';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    exampleSelect.addEventListener('change', (event) => {
        const selectedValue = event.target.value;
        const selectedExample = examples[selectedValue];
        if (selectedExample && htmlEditor) {
            htmlEditor.setValue(selectedExample);
            const selectedText = event.target.options[event.target.selectedIndex].text;
            showStatus(`Loaded "${selectedText}" example!`, 'success', 2000);
        }
    });

    fullscreenButton.addEventListener('click', () => {
        modalPreviewFrame.srcdoc = previewFrame.srcdoc;
        previewModal.classList.add('active');
    });

    modalCloseButton.addEventListener('click', () => {
        previewModal.classList.remove('active');
        modalPreviewFrame.srcdoc = ''; 
    });
});

const processAll = (html) => {
    hideStatus();
    if (!html || html.trim() === '') {
        if(syqlorixEditor) syqlorixEditor.setValue('');
        document.getElementById('preview-frame').srcdoc = initialPreviewContent;
        return;
    }
    const result = convertHtmlToSyqlorix(html);
    const previewHtml = renderPreviewFromHtml(html);
    if(syqlorixEditor) syqlorixEditor.setValue(result.code);
    document.getElementById('preview-frame').srcdoc = previewHtml;
};

const renderPreviewFromHtml = (htmlString) => {
    try {
        const isFullDocument = htmlString.trim().toLowerCase().includes('<html');
        if (!isFullDocument) return `<body>${htmlString}</body>`;
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const parseError = doc.querySelector('parsererror');
        if (parseError) throw new Error("HTML has errors. Preview is paused.");
        return `<!DOCTYPE html>\n${renderNodeAsHtml(doc.documentElement, 0)}`;
    } catch (e) {
        showStatus(e.message, 'error');
        return `<body style="font-family: sans-serif; color: #c00; display: grid; place-content: center; height: 100%; margin: 0;"><p>${e.message}</p></body>`;
    }
};

const renderNodeAsHtml = (node, indentLevel) => {
    const indent = "  ".repeat(indentLevel);
    const selfClosingTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
    if (node.nodeType === Node.TEXT_NODE) { const text = node.textContent.trim(); return text ? `${indent}${text}\n` : ''; }
    if (node.nodeType === Node.COMMENT_NODE) { const text = node.textContent.trim(); return `${indent}<!-- ${text} -->\n`; }
    if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        const attributes = Array.from(node.attributes).map(attr => ` ${attr.name}="${attr.value}"`).join('');
        if (selfClosingTags.has(tagName)) { return `${indent}<${tagName}${attributes}>\n`; }
        let html = `${indent}<${tagName}${attributes}>\n`;
        Array.from(node.childNodes).forEach(child => { html += renderNodeAsHtml(child, indentLevel + 1); });
        html += `${indent}</${tagName}>\n`;
        return html;
    }
    return '';
};

const convertHtmlToSyqlorix = (htmlString) => {
    try {
        const isFullDocument = htmlString.trim().toLowerCase().includes('<html');
        if (isFullDocument) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html');
            const parseError = doc.querySelector('parsererror');
            if (parseError) throw new Error("HTML parsing error. Check for unclosed tags.");
            const headNode = doc.querySelector('head');
            const bodyNodes = doc.querySelectorAll('body');
            const bodyNode = bodyNodes[bodyNodes.length - 1];
            if (!headNode || !bodyNode) throw new Error("A full HTML document requires a <head> and <body>.");
            let cssContent = '';
            const styleTags = headNode.querySelectorAll('style');
            styleTags.forEach(style => { cssContent += style.innerHTML.trim() + '\n\n'; style.remove(); });
            let jsContent = '';
            const scriptTags = Array.from(doc.querySelectorAll('script'));
            const externalScripts = [];
            scriptTags.forEach(script => { if (script.src) { externalScripts.push(script); } else { jsContent += script.innerHTML.trim() + '\n\n'; } script.remove(); });
            const headChildren = processNodeForPython(headNode, 1);
            const bodyChildren = processNodeForPython(bodyNode, 1);
            const head_args = [];
            if (cssContent.trim()) {
                head_args.push('main_css');
            }
            if (headChildren.trim()) {
                head_args.push(headChildren);
            }

            const body_args = [];
            if (bodyChildren.trim()) {
                body_args.push(bodyChildren);
            }
            externalScripts.forEach(script => {
                body_args.push(`script(src="${script.src}")`);
            });
            if (jsContent.trim()) {
                body_args.push('interactive_js');
            }
            let code = `from syqlorix import *\n\n`;
            code += `doc = Syqlorix()\n\n`;
            if (cssContent.trim()) { 
                code += `# --- Extracted CSS --- \n`;
                code += `main_css = style("""\n${cssContent.trim()}\n""")\n\n`; 
            }
            if (jsContent.trim()) { 
                code += `# --- Extracted JavaScript --- \n`;
                code += `interactive_js = script("""\n${jsContent.trim()}\n""")\n\n`; 
            }

            code += `# --- Define the main route --- \n`;
            code += `@doc.route('/')\n`;
            code += `def main_page(request):\n`;
            code += `    return Syqlorix(\n`;
            code += `        head(\n            ${head_args.join(',\n            ')}\n        ),\n`;
            code += `        body(\n            ${body_args.join(',\n            ')}\n        )\n`;
            code += `    )\n\n`;

            code += `# To run this script, save it as app.py and execute:\n`;
            code += `# syqlorix run app.py`;

            return { success: true, code: code };
        } else {
            const parser = new DOMParser();
            const doc = parser.parseFromString(`<body>${htmlString}</body>`, 'text/html');
            const fragmentNodes = Array.from(doc.body.childNodes);
            const syqlorixCode = fragmentNodes.map(node => processNodeForPython(node, 1)).filter(Boolean).join(',\n');
            const finalCode = `from syqlorix import *\n\nmy_component = div(\n${syqlorixCode}\n)`;
            return { success: true, code: finalCode };
        }
    } catch (e) {
        return { success: false, code: `# Conversion failed: ${e.message}` };
    }
};

const processNodeForPython = (node, indentLevel) => {
    const pythonKeywords = new Set(['for', 'in', 'is', 'if', 'else', 'while', 'class', 'def', 'return', 'yield', 'lambda', 'with', 'as', 'try', 'except', 'finally', 'import', 'from', 'global', 'nonlocal', 'pass', 'assert', 'break', 'continue', 'del', 'raise', 'async', 'await']);
    const indent = '    '.repeat(indentLevel);
    if (node.nodeType === Node.TEXT_NODE) { const text = node.textContent.trim(); return text ? `${indent}"${text.replace(/"/g, '\\"')}"` : null; }
    if (node.nodeType === Node.COMMENT_NODE) { const text = node.textContent.trim(); return `${indent}Comment("${text.replace(/"/g, '\\"')}")`; }
    if (node.nodeType === Node.ELEMENT_NODE) {
        let tagName = node.tagName.toLowerCase();
        const srcAttr = node.getAttribute('src');
        if (tagName === 'script' && srcAttr) { return `${indent}script(src="${srcAttr}")`; }
        const content = node.innerHTML.trim();
        if ((tagName === 'style' || tagName === 'script')) {
            if(content) {
                const pythonString = `"""\n${content}\n"""`;
                return `${indent}${tagName}(${pythonString})`;
            }
            return null;
        }
        let pythonTagName = tagName;
        if (['html', 'head', 'body'].includes(pythonTagName)) { return Array.from(node.childNodes).map(child => processNodeForPython(child, indentLevel)).filter(Boolean).join(',\n'); }
        if (pythonTagName === 'input') pythonTagName = 'input_';
        const children = Array.from(node.childNodes).map(child => processNodeForPython(child, indentLevel + 1)).filter(Boolean);
        const attributes = Array.from(node.attributes).map(attr => { 
            let attrName = attr.name.replace(/-/g, '_');
            if (pythonKeywords.has(attrName)) {
                attrName += '_';
            }
        if (attr.value === '') return `${attrName}=True`; return `${attrName}="${attr.value.replace(/"/g, '\\"')}"`; });
        let args = [];
        if (children.length > 0) args.push(`\n${children.join(',\n')}\n${indent}`);
        if (attributes.length > 0) { if (children.length > 0) args.push(', '); args.push(attributes.join(', ')); }
        return `${indent}${pythonTagName}(${args.join('')})`;
    }
    return null;
};
    
const showStatus = (message, type = 'error', duration = 0) => {
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = message;
    statusMessage.className = `status ${type}`;
    if (duration > 0) setTimeout(() => hideStatus(), duration);
};

const hideStatus = () => {
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = '';
    statusMessage.className = 'status';
};
