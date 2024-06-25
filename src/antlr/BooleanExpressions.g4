// BooleanExpressions.g4
grammar BooleanExpressions;

start
    : expression EOF
    ;

expression
    : booleanExpression
    ;

booleanExpression
    : booleanExpression '&&' booleanExpression
    | booleanExpression '||' booleanExpression
    | '!' booleanExpression
    | comparison
    | 'true'
    | 'false'
    | '(' booleanExpression ')'
    ;

comparison
    : integerExpression comparator integerExpression
    ;

comparator
    : '<' | '<=' | '==' | '!=' | '>=' | '>'
    ;

integerExpression
    : integerExpression '+' integerExpression
    | place
    | INT
    ;

place
    : ID
    ;

ID
    : [a-zA-Z_][a-zA-Z0-9_]*
    ;

INT
    : [0-9]+
    ;

WS
    : [ \t\n\r]+ -> skip
    ;
