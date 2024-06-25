import antlr4 from 'antlr4';
import * as monaco from 'monaco-editor';
import BooleanExpressionsLexer from './antlr/BooleanExpressionsLexer.js';
import BooleanExpressionsParser from './antlr/BooleanExpressionsParser.js';

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

class SyntaxErrorListener extends antlr4.error.ErrorListener {
  constructor() {
    super();
    this.errors = [];
  }

  syntaxError(recognizer, offendingSymbol, line, column, msg, e) {
    this.errors.push({ line, column, msg });
  }

  getErrors() {
    return this.errors;
  }
}

export default class BooleanExpressionEditor {
  constructor(sharedState) {
    this.sharedState = sharedState;
    this.editor = null;
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

    this.editor = monaco.editor.create(document.getElementById('formula-editor'), {
      value: '',
      language: 'booleanExpressions',
      theme: 'vs-dark',
      suggest: {
        showKeywords: true
      },
      automaticLayout: true
    });

    this.editor.onDidChangeModelContent(() => {
      const value = this.editor.getValue();
      this.parseBooleanExpression(value);
    });

    monaco.languages.registerCompletionItemProvider('booleanExpressions', {
      provideCompletionItems: (model, position) => {
        const suggestions = this.getSuggestions(model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        }));
        return { suggestions };
      }
    });
  }

  parseBooleanExpression(input) {
    const errorListener = new SyntaxErrorListener();
    const chars = new antlr4.InputStream(input);
    const lexer = new BooleanExpressionsLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new BooleanExpressionsParser(tokens);
    parser.buildParseTrees = true;
    parser.removeErrorListeners();
    parser.addErrorListener(errorListener);
    const tree = parser.start();

    const errors = errorListener.getErrors();
    this.validateIdentifiers(tree);
    this.updateEditorMarkers(errors);
    console.log(tree.toStringTree(parser.ruleNames));
  }

  validateIdentifiers(tree) {
    const errors = [];
    const placeNames = this.sharedState.petriNet.reversePlaces;
    const visitor = new IdentifierVisitor(placeNames, errors);
    visitor.visit(tree);
    this.updateEditorMarkers(errors);
  }

  updateEditorMarkers(errors) {
    const markers = errors.map(error => ({
      severity: monaco.MarkerSeverity.Error,
      startLineNumber: error.line,
      startColumn: error.column + 1,
      endLineNumber: error.line,
      endColumn: error.column + 2,
      message: error.msg
    }));
    monaco.editor.setModelMarkers(this.editor.getModel(), 'booleanExpressions', markers);
  }

  getSuggestions(textUntilPosition) {
    const placeNames = this.sharedState.petriNet.reversePlaces;
    return placeNames.map(place => ({
      label: place,
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: place
    }));
  }
}

class IdentifierVisitor extends BooleanExpressionsParser.BooleanExpressionsParserVisitor {
  constructor(placeNames, errors) {
    super();
    this.placeNames = placeNames;
    this.errors = errors;
  }

  visitTerminal(node) {
    if (node.symbol.type === BooleanExpressionsLexer.ID && !this.placeNames.includes(node.getText())) {
      this.errors.push({
        line: node.symbol.line,
        column: node.symbol.column,
        msg: `Undefined place: ${node.getText()}`
      });
    }
  }
}
