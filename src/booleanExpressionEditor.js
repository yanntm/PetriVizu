import BooleanExpressionsLexer from './antlr/BooleanExpressionsLexer.js';
import BooleanExpressionsParser from './antlr/BooleanExpressionsParser.js';

export default class BooleanExpressionEditor {
  constructor(sharedState) {
    this.sharedState = sharedState;
    this.initializeEditor();
  }

  async initializeEditor() {
    const monaco = await import('monaco-editor');

    monaco.languages.register({ id: 'booleanExpressions' });

    monaco.languages.setMonarchTokensProvider('booleanExpressions', {
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

    const editor = monaco.editor.create(document.getElementById('formula-editor'), {
      value: '',
      language: 'booleanExpressions',
      theme: 'vs-dark',
      suggest: {
        showKeywords: true
      }
    });

    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      this.parseBooleanExpression(value);
    });

    monaco.languages.registerCompletionItemProvider('booleanExpressions', {
      provideCompletionItems: (model, position) => {
        const suggestions = this.getSuggestions(model.getValueInRange({ startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column }));
        return { suggestions };
      }
    });
  }

  parseBooleanExpression(input) {
    const chars = new antlr4.InputStream(input);
    const lexer = new BooleanExpressionsLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new BooleanExpressionsParser(tokens);
    parser.buildParseTrees = true;
    const tree = parser.start();
    console.log(tree.toStringTree(parser.ruleNames));
  }

  getSuggestions(textUntilPosition) {
    const placeNames = this.sharedState.petriNet.listPlaceNames();
    return placeNames.map(place => ({
      label: place,
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: place
    }));
  }
}