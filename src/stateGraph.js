// stateGraph

class StateGraph {
    constructor(petriNet) {
        this.states = new Map(); // Map to store state representations with unique IDs
        this.stateVectors = []; // Vector to store state vectors by state ID
        this.labels = []; // Vector to store labels for each state ID
        this.initialStateId = 0; // Assume the initial state ID is 0
        this.stateCounter = 0; // Counter to assign unique IDs to states
        this.successors = []; // Vector of lists to store successors for each state ID
        this.petriNet = petriNet; // Store the PetriNet object for label interpretation
    }

    getId(state) {
        const stateKey = JSON.stringify(state); // Convert the state to a string key
        if (!this.states.has(stateKey)) {
            this.states.set(stateKey, this.stateCounter);
            this.stateVectors[this.stateCounter] = state.slice(); // Store the state vector
            this.successors[this.stateCounter] = []; // Initialize the successor list for the new state
            this.labels[this.stateCounter] = this.computeLabel(state); // Compute and store the label
            this.stateCounter++;
        }
        return this.states.get(stateKey);
    }

    computeLabel(state) {
        let label = [];
        this.petriNet.reversePlaces.forEach(placeId => {
            const placeIndex = this.petriNet.places.get(placeId);
            const tokenCount = state[placeIndex];
            if (tokenCount > 0) {
                label.push(tokenCount === 1 ? placeId : `${placeId}(${tokenCount})`);
            }
        });
        return label.join(',');
    }


    addEdge(sourceId, destinationId, transitionId) {
        this.successors[sourceId].push({ target: destinationId, transition: transitionId });
    }

    listAllStates() {
        return Array.from(this.states.values());
    }

    getState(stateId) {
        return this.stateVectors[stateId] || null;
    }

    getStateLabel(stateId) {
        return this.labels[stateId] || null;
    }

    getInitialStateId() {
        return this.initialStateId;
    }

    getSuccessors(stateId) {
        return this.successors[stateId] || [];
    }
}

export default StateGraph;
