 import antlr4 from 'antlr4';
import PropertiesLexer from './antlr/PropertiesLexer.js';
import PropertiesParser from './antlr/PropertiesParser.js';
import PropertiesVisitor from './antlr/PropertiesVisitor.js';

class PropertyExportVisitor extends PropertiesVisitor {
    constructor() {
        super();
        this.xmlParts = [];
    }

    visitProperties(ctx) {
        this.xmlParts.push('<?xml version="1.0" encoding="utf-8"?>\n');
        this.xmlParts.push('<property-set xmlns="http://mcc.lip6.fr/">\n');
        this.visitChildren(ctx);
        this.xmlParts.push('</property-set>\n');
        return null;
    }

    visitProperty(ctx) {
        const name = ctx.name.getText().replace(/"/g, '');
        this.xmlParts.push(`<property>\n<id>${name}</id>\n`);
        this.xmlParts.push('<description>Automatically generated</description>\n');
        this.xmlParts.push('<formula>\n');
        this.visit(ctx.logicProp());
        this.xmlParts.push('</formula>\n</property>\n');
        return null;
    }

    visitBoolProp(ctx) {
        this.visit(ctx.children[0]);
        return null;
    }

    visitSafetyProp(ctx) {
        this.visit(ctx.children[0]);
        return null;
    }

    visitReachableProp(ctx) {
        this.xmlParts.push('<exists-path><finally>\n');
        this.visit(ctx.predicate());
        this.xmlParts.push('</finally></exists-path>\n');
        return null;
    }

    visitInvariantProp(ctx) {
        this.xmlParts.push('<all-paths><globally>\n');
        this.visit(ctx.predicate());
        this.xmlParts.push('</globally></all-paths>\n');
        return null;
    }

    visitAtomicProp(ctx) {
        this.visit(ctx.predicate());
        return null;
    }

    visitCtlProp(ctx) {
        this.visit(ctx.predicate());
        return null;
    }

    visitLtlProp(ctx) {
        this.visit(ctx.predicate());
        return null;
    }

    visitComparison(ctx) {
        const operator = ctx.operator().getText();
        switch (operator) {
            case '<=':
                this.xmlParts.push('<integer-le>\n');
                break;
            case '<':
                this.xmlParts.push('<integer-lt>\n');
                break;
            case '>=':
                this.xmlParts.push('<integer-ge>\n');
                break;
            case '>':
                this.xmlParts.push('<integer-gt>\n');
                break;
            case '==':
                this.xmlParts.push('<integer-eq>\n');
                break;
            case '!=':
                this.xmlParts.push('<integer-ne>\n');
                break;
            default:
                throw new Error(`Unsupported operator: ${operator}`);
        }
        this.visit(ctx.left);
        this.visit(ctx.right);
        this.xmlParts.push(`</${this.getTagNameForOperator(operator)}>\n`);
        return null;
    }

    getTagNameForOperator(operator) {
        switch (operator) {
            case '<=':
                return 'integer-le';
            case '<':
                return 'integer-lt';
            case '>=':
                return 'integer-ge';
            case '>':
                return 'integer-gt';
            case '==':
                return 'integer-eq';
            case '!=':
                return 'integer-ne';
            default:
                throw new Error(`Unsupported operator: ${operator}`);
        }
    }

    visitConstant(ctx) {
        this.xmlParts.push(`<integer-constant>${ctx.getText()}</integer-constant>\n`);
        return null;
    }

    visitReference(ctx) {
        this.xmlParts.push(`<tokens-count><place>${ctx.getText()}</place></tokens-count>\n`);
        return null;
    }

    // Add more visit methods for other expressions as needed...
}

function parseInput(input) {
    const chars = new antlr4.InputStream(input);
    const lexer = new PropertiesLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new PropertiesParser(tokens);
    parser.buildParseTrees = true;
    return parser.properties();
}

function exportToXML(input, outputPath) {
    const tree = parseInput(input);
    const visitor = new PropertyExportVisitor();
    tree.accept(visitor);
    console.log(visitor.xmlParts.join(''));
}


export function test () {
const testInput = `
property "ReachabilityProperty1" [reachable] : "P1" + P2 <= 5;
property "InvariantProperty1" [invariant] : P1 + P2 > 5;
property "AP1" [atom] : P1 <= P2;
property "RefAtom" [reachable] : AP1;
property "CTLProperty1" [ctl] : AG(P1 <= 10 && P2 > 3);
property "CTLProperty2" [ctl] : E (P1 <= 10) U (P2 > 3);
property "LTLProperty1" [ltl] : G(P1 <= 10);
property "LTLProperty2" [ltl] : F(P2 > 3 U P1 <= 10);
property "BoundsProperty1" [bounds] : P1 + P2;
property "KeywordProperty" [ctl] : "A"==0 && AX(P1 <= 10);
property "ComplexProperty" [ltl] : F("A" + B == 0 U C <= "F" + 5);
`;

const outputPath = 'propertySet.xml';
exportToXML(testInput, outputPath);
console.log(`Properties exported to ${outputPath}`);
}

