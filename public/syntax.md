# Property Syntax

The syntax supports defining a set of properties; each one will have a name and a definition.
These are some examples of property definitions.

```
property "ReachabilityProperty1" [reach] : EF "P1" + P2 <= 5;
property "InvariantProperty1" [reach] : AG (P1 + P2 > 5);
property "AP1" [atom] : P1 <= P2;
property "RefAtom" [reach] : EF @AP1;
property "CTLProperty1" [ctl] : AG(P1 <= 10 && P2 > 3);
property "CTLProperty2" [ctl] : E (P1 <= 10) U (P2 > 3);
property "LTLProperty1" [ltl] : G(P1 <= 10);
property "LTLProperty2" [ltl] : F(P2 > 3 U P1 <= 10);
property "BoundsProperty1" [bounds] : P1 + P2;
property "KeywordProperty" [ctl] : "A"==0 && AX(P1 <= 10);
property "ComplexProperty" [ltl] : F("A" + B == 0 U C <= "F" + 5);
```

## Atoms, Boolean Predicates

Atoms are the simplest elements; they do not define a property per se but can be referred to in other properties using `@nameofatom`.
An atom is defined by providing a Boolean predicate.

### Examples of Atoms
``` 
property "InCS" [atom] : criticalSection >= 1;
property "Atom2" [atom] : P1 <= P2;
property "Atom3" [atom] : P1 + P2 <= 10;
property "Atom4" [atom] : P3 > 5;
property "Atom5" [atom] : @Atom1 && @Atom2;
```

A comparison of a place or sum of places to another place expression or constants is our atomic boolean predicate.

### Comparison Operators
- `<=`: Less than or equal
- `<`: Less than
- `>=`: Greater than or equal
- `>`: Greater than
- `==`: Equal
- `!=`: Not equal

To refer to a place, simply use its name. If the name is a keyword (A, E, F, G, U, X, AF, AG, AX, EF, EG, EX...) it must be quoted.

``` 
property "Incorrect_Aless5" [atom] : A <= 5;
property "Correct_Aless5" [atom] : "A" <= 5;
```

Predicates are defined using boolean operators `&&` (and), `||` (or), `!` (not). 
Usual priority applies: `!`, `&&`, `||`, but if in doubt simply add more parentheses.

``` 
property "ComplexAtom1" [atom] : P1 <= 5 && P2 > 3;
property "ComplexAtom2" [atom] : !(P1 == 0) || P3 <= 4;
```

## Reachability Property Definitions

  ``` 
  property "PropertyName" [reach] : (AG|EF) Predicate;
  ```

The body of a reachability property is prefixed by 
* EF :Exists in Future, the situation described in the predicate is reachable from initial
* AG :Always Globally, the situation by the predicate is an invariant, true of all reachable states

The predicate itself uses the same syntax as atoms, and can also refer to atoms.

### Bounds Properties
Bounds properties compute the maximum number of tokens that can occupy the provided places in any reachable marking.

``` 
property "PropertyName" [bounds] : BoundsExpression;
```

Examples :
```
property "SinglePlaceBounds" [bounds] : P1;
property "SumPlaceBounds" [bounds] : P1 + P2;
```

Technically, a bounds property is defined by providing a set of places,
 in practice we use `+` to combine places (the query computes the bounds of the given expression).

### CTL Properties

CTL properties define temporal logic properties using Computation Tree Logic.

``` 
property "PropertyName" [ctl] : CTLFormula;
```

### CTL Temporal Operators
- **AG phi**: Always globally. From this point on, phi is an invariant satisfied by all reachable states.
- **AF phi**: Always in the future. On all paths from here, phi will eventually be satisfied.
- **AX phi**: Always next. Phi is satisfied in all next state(s).
- **EG phi**: Exists globally. There exists a path where phi is satisfied continuously.
- **EF phi**: Exists in the future. There exists a path where phi is eventually satisfied.
- **EX phi**: Exists next. There exists a successor state satisfying phi.
- **A(phi U psi)**: Always until. Phi holds until psi is satisfied in all paths.
- **E(phi U psi)**: Exists until. There exists a path where phi holds until psi is satisfied.

In addition, CTL formulas can be combined using boolean operators `&&` (and), `||` (or), `!` (not) as well as `->` implication.
CTL formulas can use `@formulaName` syntax to refer to atoms, reachability properties and CTL properties that are defined higher in the file.

### LTL Properties
LTL properties define temporal logic properties using Linear Temporal Logic.

``` 
property "PropertyName" [ltl] : LTLFormula;
```

### LTL Temporal Operators
- **G phi**: Globally. On all paths, phi is satisfied in all reachable states.
- **F phi**: Finally. On all paths, phi will eventually be satisfied.
- **X phi**: Next. On all paths, phi is satisfied in the next state.
- **phi U psi**: Until. On all paths, phi holds until psi is satisfied.

In addition, LTL formulas can be combined using boolean operators `&&` (and), `||` (or), `!` (not) as well as `->` implication.
LTL formulas can use `@formulaName` syntax to refer to atoms, and LTL properties that are defined higher in the file.


### Examples
``` 
property "CTLProperty1" [ctl] : AG(P1 <= 10 && P2 > 3);
property "CTLProperty2" [ctl] : E(P1 <= 10) U (P2 > 3);

property "LTLProperty1" [ltl] : G(P1 <= 10);
property "LTLProperty2" [ltl] : F(P2 > 3 U P1 <= 10);
```

## Caveats and Issues

- **Temporal operators**: Whitespace around temporal operators is mandatory. For instance, `GF phi` is parsed as an ID in LTL, 
you must use spaces to separate the operators, e.g. `G F phi`. Similarly in CTL, the operators (except Until) are two letters,
so `AG phi` is correct but `A G phi` is illegal. 
- **Quoted Strings**: If an ID is a temporal operator (e.g., `A`, `U`, `X`...), quote it as a string: `"A"`.

