import { ErrorListener, CharStreams, CommonTokenStream } from 'antlr4';
import * as monaco from 'monaco-editor';
import PropertiesLexer from './antlr/PropertiesLexer';
import PropertiesParser from './antlr/PropertiesParser';
import PropertiesVisitor from './antlr/PropertiesVisitor';
import { initializeMonacoEditor } from './monacoSetup';

interface Error {
  line: number;
  column: number;
  msg: string;
}

class SyntaxErrorListener implements ErrorListener<any> {
  errors: Error[];

  constructor() {
    this.errors = [];
  }

  syntaxError(recognizer: any, offendingSymbol: any, line: number, column: number, msg: string, e: any) {
    this.errors.push({ line, column, msg });
  }

  getErrors() {
    return this.errors;
  }
}

class IdentifierVisitor extends PropertiesVisitor<void> {
  placeNames: string[];
  errors: Error[];

  constructor(placeNames: string[], errors: Error[]) {
    super();
    this.placeNames = placeNames;
    this.errors = errors;
  }

  visitTerminal(node: any) {
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
  sharedState: any;
  editor: monaco.editor.IStandaloneCodeEditor | null = null;

  constructor(sharedState: any) {
    this.sharedState = sharedState;
    this.initializeEditor();
  }

  async initializeEditor() {
    this.editor = await initializeMonacoEditor('Properties', 'formula-editor');

    this.editor.onDidChangeModelContent(() => {
      const value = this.editor!.getValue();
      this.parseBooleanExpression(value);
    });

    monaco.languages.registerCompletionItemProvider('Properties', {
      provideCompletionItems: (model, position) => {
        const suggestions = this.getSuggestions(model, position);
        return { suggestions };
      }
    });
  }

parseBooleanExpression(input: string) {
  const errorListener = new SyntaxErrorListener();
  
  // Create input stream from the input string
  const inputStream = CharStreams.fromString(input);
  
  // Create the lexer using the input stream
  const lexer = new PropertiesLexer(inputStream);
  
  // Add error listener to the lexer
  lexer.addErrorListener(errorListener);
  
  // Create the token stream from the lexer
  const tokenStream = new CommonTokenStream(lexer);
  
  // Create the parser using the token stream
  const parser = new PropertiesParser(tokenStream);
  parser.buildParseTrees = true;
  
  // Add error listener to the parser
  parser.addErrorListener(errorListener);
  
  // Parse the input to create the parse tree
  const tree = parser.properties();
  
  // Retrieve and handle errors
  const errors = errorListener.getErrors();
  this.validateIdentifiers(tree);
  this.updateEditorMarkers(errors);
  console.log(tree.toStringTree(parser.ruleNames, parser));  
}


  validateIdentifiers(tree: any) {
    const errors: Error[] = [];
    const placeNames = this.sharedState.petriNet.reversePlaces;
    const visitor = new IdentifierVisitor(placeNames, errors);
    visitor.visit(tree);
    this.updateEditorMarkers(errors);
  }

  updateEditorMarkers(errors: Error[]) {
    const markers = errors.map(error => ({
      severity: monaco.MarkerSeverity.Error,
      startLineNumber: error.line,
      startColumn: error.column + 1,
      endLineNumber: error.line,
      endColumn: error.column + 2,
      message: error.msg
    }));
    monaco.editor.setModelMarkers(this.editor!.getModel()!, 'Properties', markers);
  }

  getSuggestions(model: monaco.editor.ITextModel, position: monaco.Position) {
    const textUntilPosition = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    });

    const placeNames = this.sharedState.petriNet.reversePlaces;
    return placeNames.map((place: string) => ({
      label: place,
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: place
    }));
  }
}
