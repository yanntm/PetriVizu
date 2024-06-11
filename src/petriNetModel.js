class PetriNet {
    constructor() {
        this.places = new Map();
        this.transitions = new Map();
        this.reversePlaces = [];
        this.reverseTransitions = [];
        this.pre = [];
        this.post = [];
        this.initialState = [];
    }

    addPlace(id, name, tokens) {
        const index = this.places.size;
        this.places.set(id, index);
        this.reversePlaces[index] = id;
        this.initialState[index] = tokens;
    }

    addTransition(id, name) {
        const index = this.transitions.size;
        this.transitions.set(id, index);
        this.reverseTransitions[index] = id;
        this.pre[index] = [];
        this.post[index] = [];
    }

    addArc(source, target, weight) {
        const sourceIndex = this.places.has(source) ? this.places.get(source) : this.transitions.get(source);
        const targetIndex = this.places.has(target) ? this.places.get(target) : this.transitions.get(target);

        if (this.transitions.has(source)) {
            this.post[sourceIndex].push([targetIndex, weight]);
        } else if (this.transitions.has(target)) {
            this.pre[targetIndex].push([sourceIndex, weight]);
        } else {
            throw new Error("Invalid arc: source and target must be either a place and a transition or vice versa.");
        }
    }

    isEnabled(state, transitionId) {
        const transitionIndex = this.transitions.get(transitionId);
        return this.pre[transitionIndex].every(([placeIndex, weight]) => state[placeIndex] >= weight);
    }

    getEnabledTransitions(state) {
        const enabledTransitions = [];
        this.transitions.forEach((index, id) => {
            if (this.isEnabled(state, id)) {
                enabledTransitions.push(id);
            }
        });
        return enabledTransitions;
    }

    fireTransition(state, transitionId) {
        if (!this.isEnabled(state, transitionId)) {
            throw new Error(`Transition ${transitionId} is not enabled.`);
        }

        const transitionIndex = this.transitions.get(transitionId);
        const newState = state.slice(); // Copy the current state

        this.pre[transitionIndex].forEach(([placeIndex, weight]) => {
            newState[placeIndex] -= weight;
        });

        this.post[transitionIndex].forEach(([placeIndex, weight]) => {
            newState[placeIndex] += weight;
        });

        return newState;
    }

    getArcs() {
        const arcs = [];
        this.transitions.forEach((tIndex, tId) => {
            this.pre[tIndex].forEach(([pIndex, weight]) => {
                arcs.push([this.reversePlaces[pIndex], tId, weight]);
            });
            this.post[tIndex].forEach(([pIndex, weight]) => {
                arcs.push([tId, this.reversePlaces[pIndex], weight]);
            });
        });
        return arcs;
    }
}

export { PetriNet };
