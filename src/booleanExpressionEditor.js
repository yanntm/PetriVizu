import antlr4 from 'antlr4';
import * as monaco from 'monaco-editor';
import PropertiesLexer from './antlr/PropertiesLexer.js';
import PropertiesParser from './antlr/PropertiesParser.js';
import PropertiesVisitor from './antlr/PropertiesVisitor.js';
import { initializeMonacoEditor } from './monacoSetup.js';

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

class IdentifierVisitor extends PropertiesVisitor {
  constructor(placeNames, errors) {
    super();
    this.placeNames = placeNames;
    this.errors = errors;
  }

  visitTerminal(node) {
    if (node.symbol.type === PropertiesLexer.ID && !this.placeNames.includes(node.getText())) {
      this.errors.push({
        line: node.symbol.line,
        column: node.symbol.column,
        msg: `Undefined place: ${node.getText()}`
      });
    }
  }
}

export default class BooleanExpressionEditor {
  constructor(sharedState) {
    this.sharedState = sharedState;
    this.editor = null;
    this.initializeEditor();
  }

  async initializeEditor() {
    this.editor = await initializeMonacoEditor('Properties', 'formula-editor');

    this.editor.onDidChangeModelContent(() => {
      const value = this.editor.getValue();
      this.parseBooleanExpression(value);
    });

    monaco.languages.registerCompletionItemProvider('Properties', {
      provideCompletionItems: (model, position) => {
        const suggestions = this.getSuggestions(model, position);
        return { suggestions };
      }
    });
  }

  parseBooleanExpression(input) {
    const errorListener = new SyntaxErrorListener();
    const chars = new antlr4.InputStream(input);
    const lexer = new PropertiesLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new PropertiesParser(tokens);
    parser.buildParseTrees = true;
    parser.removeErrorListeners();
    parser.addErrorListener(errorListener);
    const tree = parser.properties();

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
    monaco.editor.setModelMarkers(this.editor.getModel(), 'Properties', markers);
  }

  getSuggestions(model, position) {
    const textUntilPosition = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    });

    const placeNames = this.sharedState.petriNet.reversePlaces;
    return placeNames.map(place => ({
      label: place,
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: place
    }));
  }
}
