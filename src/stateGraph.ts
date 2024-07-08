import { PetriNet, State } from './petriNetModel';

interface Successor {
    target: number;
    transition: string;
}

class StateGraph {
    private states: Map<string, number>;
    private stateVectors: State[];
    private labels: string[];
    private initialStateId: number;
    private stateCounter: number;
    private successors: Successor[][];
    private petriNet: PetriNet;

    constructor(petriNet: PetriNet) {
        this.states = new Map(); // Map to store state representations with unique IDs
        this.stateVectors = []; // Vector to store state vectors by state ID
        this.labels = []; // Vector to store labels for each state ID
        this.initialStateId = 0; // Assume the initial state ID is 0
        this.stateCounter = 0; // Counter to assign unique IDs to states
        this.successors = []; // Vector of lists to store successors for each state ID
        this.petriNet = petriNet; // Store the PetriNet object for label interpretation
    }

    getId(state: State): number {
        const stateKey = JSON.stringify(state); // Convert the state to a string key
        if (!this.states.has(stateKey)) {
            this.states.set(stateKey, this.stateCounter);
            this.stateVectors[this.stateCounter] = state.slice(); // Store the state vector
            this.successors[this.stateCounter] = []; // Initialize the successor list for the new state
            this.labels[this.stateCounter] = this.computeLabel(state); // Compute and store the label
            this.stateCounter++;
        }
        return this.states.get(stateKey)!;
    }

    private computeLabel(state: State): string {
        const label = this.petriNet.placeNames
            .map((placeId, placeIndex) => {
                const tokenCount = state[placeIndex];
                return tokenCount > 0 ? (tokenCount === 1 ? placeId : `${placeId}(${tokenCount})`) : null;
            })
            .filter(label => label !== null);
        return label.join(',');
    }

    addEdge(sourceId: number, destinationId: number, transitionId: string): void {
        this.successors[sourceId].push({ target: destinationId, transition: transitionId });
    }

    listAllStates(): number[] {
        return Array.from(this.states.values());
    }

    getState(stateId: number): State | null {
        return this.stateVectors[stateId] || null;
    }

    getStateLabel(stateId: number): string | null {
        return this.labels[stateId] || null;
    }

    getInitialStateId(): number {
        return this.initialStateId;
    }

    getSuccessors(stateId: number): Successor[] {
        return this.successors[stateId] || [];
    }
}

export default StateGraph;
