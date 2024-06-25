import * as monaco from 'monaco-editor';

self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    if (label === 'json') {
      return './json.worker.bundle.js';
    }
    if (label === 'css') {
      return './css.worker.bundle.js';
    }
    if (label === 'html') {
      return './html.worker.bundle.js';
    }
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.bundle.js';
    }
    return './editor.worker.bundle.js';
  }
};

export async function initializeMonacoEditor(languageId, elementId) {
  const monaco = await import('monaco-editor');

  monaco.languages.register({ id: languageId });

  monaco.languages.setMonarchTokensProvider(languageId, {
    tokenizer: {
      root: [
        [/\b(true|false)\b/, 'keyword'],
        [/[a-zA-Z_][\w]*/, 'identifier'],
        [/[{}()\[\]]/, '@brackets'],
        [/[<>]=?|[!=]=|[&|~]/, 'operator'],
        [/[-+\/*=]/, 'operator'],
        [/[;,.]/, 'delimiter'],
        [/".*?"/, 'string'],
      ]
    }
  });

  const editor = monaco.editor.create(document.getElementById(elementId), {
    value: '',
    language: languageId,
    theme: 'vs-dark',
    suggest: {
      showKeywords: true
    },
    automaticLayout: true
  });

  return editor;
}
