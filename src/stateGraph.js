// stateGraph.js

class StateGraph {
    constructor() {
        this.states = new Map(); // Map to store state representations with unique IDs
        this.initialStateId = 0; // Assume the initial state ID is 0
        this.stateCounter = 0; // Counter to assign unique IDs to states
        this.successors = []; // Vector of lists to store successors for each state ID
    }

    getId(state) {
        const stateKey = JSON.stringify(state); // Convert the state to a string key
        if (!this.states.has(stateKey)) {
            this.states.set(stateKey, this.stateCounter);
            this.successors[this.stateCounter] = []; // Initialize the successor list for the new state
            this.stateCounter++;
        }
        return this.states.get(stateKey);
    }

    addEdge(sourceId, destinationId, transitionId) {
        this.successors[sourceId].push({ target: destinationId, transition: transitionId });
    }

    listAllStates() {
        return Array.from(this.states.values());
    }

    getStateLabel(stateId) {
        for (const [key, value] of this.states.entries()) {
            if (value === stateId) {
                return key;
            }
        }
        return null;
    }

    getInitialStateId() {
        return this.initialStateId;
    }

    getSuccessors(stateId) {
        return this.successors[stateId] || [];
    }
}

export default StateGraph;
