class Trace {
    constructor() {
        this.transitions = [];
    }

    addTransition(transitionId) {
        this.transitions.push(transitionId);
    }

    getTransitions() {
        return this.transitions;
    }

    clear() {
        this.transitions = [];
    }
}

export default Trace;
