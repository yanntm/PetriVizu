class Place {
    constructor(id, name, tokens) {
        this.id = id;
        this.name = name;
        this.tokens = tokens;
    }
}

class Transition {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

class Arc {
    constructor(source, target, weight) {
        this.source = source;
        this.target = target;
        this.weight = weight;
    }
}

class PetriNet {
    constructor() {
        this.places = [];
        this.transitions = [];
        this.arcs = [];
    }

    addPlace(id, name, tokens) {
        this.places.push(new Place(id, name, tokens));
    }

    addTransition(id, name) {
        this.transitions.push(new Transition(id, name));
    }

    addArc(source, target, weight) {
        this.arcs.push(new Arc(source, target, weight));
    }
}

export { PetriNet };
