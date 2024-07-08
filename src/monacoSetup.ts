import * as monaco from 'monaco-editor';

self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId: string, label: string) {
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

export async function initializeMonacoEditor(languageId: string, elementId: string): Promise<monaco.editor.IStandaloneCodeEditor> {
  const monacoEditor = await import('monaco-editor');

  monacoEditor.languages.register({ id: languageId });

  monacoEditor.languages.setMonarchTokensProvider(languageId, {
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

  const editor = monacoEditor.editor.create(document.getElementById(elementId) as HTMLElement, {
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
