grammar Properties;


/**
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

*/

properties
    : property* EOF
    ;

property
    : 'property' (name=ID | name=STRING) body=logicProp ';'
    ;

logicProp
    : boundsProp
    | boolProp
    ;

boolProp
    : safetyProp
    | ctlProp
    | ltlProp
    | atomicProp
    ;

safetyProp
    : reachableProp
    | invariantProp
    ;

boundsProp
    : '[' 'bounds' ']' ':' target=boundsPredicate
    ;

reachableProp
    : '[' 'reachable' ']' ':' predicate=pOr
    ;

invariantProp
    : '[' 'invariant' ']' ':' predicate=pOr
    ;

atomicProp
    : '[' 'atom' ']' ':' predicate=pOr
    ;

ctlProp
    : '[' 'ctl' ']' ':' predicate=ctlUntil
    ;

ltlProp
    : '[' 'ltl' ']' ':' predicate=ltlUntil
    ;

/* =====   Arithmetic expressions ===== */

/* ====== Arithmetic operators ======= */
// by order of increasing precedence
addition
    : primary ( ( '+' | '-' ) primary )*
    ;

primary
    : variableReference
    | constRef
    | '(' addition ')'
    | '(' wrapBoolExpr ')'
    ;

constRef
    : constant
    | paramRef
    ;

wrapBoolExpr
    : value=pOr
    ;

constant
    : INT
    ;

pAddition
    : pPrimary ( ( '+' | '-' ) pPrimary )*
    ;

pPrimary
    : reference
    | constRef
    | '(' pAddition ')'
    | '(' pWrapBoolExpr ')'
    ;

pWrapBoolExpr
    : value=pOr
    ;

pOr
    : pAnd ( '||' pAnd )*
    ;

pAnd
    : pNot ( '&&' pNot )*
    ;

pNot
    : '!' pPrimaryBool
    | pPrimaryBool
    ;

pPrimaryBool
    : 'true'
    | 'false'
    | pComparison
    | '(' pOr ')'
    | reference
    ;

pComparison
    : left=pAddition operator=comparisonOperators right=pAddition
    ;

comparisonOperators
    : '<='
    | '<'
    | '>='
    | '>'
    | '=='
    | '!='
    ;

ctlAddition
    : ctlPrimary ( ( '+' | '-' ) ctlPrimary )*
    ;

ctlPrimary
    : reference
    | constRef
    | '(' ctlAddition ')'
    | '(' ctlWrapBoolExpr ')'
    ;

ctlWrapBoolExpr
    : value=ctlOr
    ;

ctlUntil
    : 'A' ctlImply 'U' ctlImply
    | 'E' ctlImply 'U' ctlImply
    | ctlImply
    ;

ctlImply
    : ctlOr ( '->' ctlOr )*
    ;

ctlOr
    : ctlAnd ( '||' ctlAnd )*
    ;

ctlAnd
    : ctlTemporal ( '&&' ctlTemporal )*
    ;

ctlTemporal
    : 'AG' ctlNot
    | 'AF' ctlNot
    | 'AX' ctlNot
    | 'EG' ctlNot
    | 'EF' ctlNot
    | 'EX' ctlNot
    | ctlNot
    ;

ctlNot
    : '!' ctlPrimaryBool
    | ctlPrimaryBool
    ;

ctlPrimaryBool
    : 'true'
    | 'false'
    | ctlComparison
    | '(' ctlUntil ')'
    ;

ctlComparison
    : left=ctlAddition operator=comparisonOperators right=ctlAddition
    ;

ltlAddition
    : ltlPrimary ( ( '+' | '-' ) ltlPrimary )*
    ;

ltlPrimary
    : reference
    | constRef
    | '(' ltlAddition ')'
    ;

ltlImply
    : ltlOr ( '->' ltlOr )*
    ;

ltlOr
    : ltlAnd ( '||' ltlAnd )*
    ;

ltlAnd
    : ltlUntil ( '&&' ltlUntil )*
    ;

ltlUntil
    : ltlFutGen ( 'U' ltlFutGen )*
    ;

ltlFutGen
    : 'F' ltlFutGen
    | 'G' ltlFutGen
    | ltlNext
    ;

ltlNext
    : 'X' ltlNext
    | ltlNot
    ;

ltlNot
    : '!' ltlPrimaryBool
    | ltlPrimaryBool
    ;

ltlPrimaryBool
    : 'true'
    | 'false'
    | ltlComparison
    | '(' ltlImply ')'
    ;

ltlComparison
    : left=ltlAddition operator=comparisonOperators right=ltlAddition
    ;

boundsPredicate
    : bpPrimary ( '+' bpPrimary )*
    ;

bpPrimary
    : reference
    | constRef
    ;

reference
    : ID | STRING
    ;

paramRef
    : PARAM
    ;

variableReference
    : ID | STRING
    ;

True
    : 'true'
    ;

False
    : 'false'
    ;

INT
    : [0-9]+
    ;

ID
    : [a-zA-Z_][a-zA-Z0-9_]*
    ;

PARAM
    : '$' ID
    ;

STRING
    : '"' ( ~[\\"\n\r] | '\\' [\\"] )* '"'
    ;

WS
    : [ \t\n\r]+ -> skip
    ;
