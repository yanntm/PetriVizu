import { Graphics } from './graphics';

function alphanumericSort(a: string, b: string): number {
    const regex = /(.*?)(\d+)?$/;
    const aMatch = a.match(regex);
    const bMatch = b.match(regex);

    const aPrefix = aMatch?.[1] || '';
    const bPrefix = bMatch?.[1] || '';
    const aNumber = aMatch?.[2] ? parseInt(aMatch[2], 10) : 0;
    const bNumber = bMatch?.[2] ? parseInt(bMatch[2], 10) : 0;

    if (aPrefix < bPrefix) return -1;
    if (aPrefix > bPrefix) return 1;
    return aNumber - bNumber;
}

function computePermutation(ids: string[]): number[] {
    const perm = ids.map((_, index) => index);

    perm.sort((a, b) => alphanumericSort(ids[a], ids[b]));

    const permutation = new Array(perm.length);
    perm.forEach((sortedIndex, originalIndex) => {
        permutation[sortedIndex] = originalIndex;
    });
    return permutation;
}

type Arc = [number, number];

class PetriNet {
    places: Map<string, number>;
    transitions: Map<string, number>;
    reversePlaces: string[];
    reverseTransitions: string[];
    pre: Arc[][];
    post: Arc[][];
    initialState: number[];
    graphics: Graphics;

    constructor() {
        this.places = new Map();
        this.transitions = new Map();
        this.reversePlaces = [];
        this.reverseTransitions = [];
        this.pre = [];
        this.post = [];
        this.initialState = [];
        this.graphics = new Graphics();
    }

    addPlace(id: string, name: string, tokens: number): void {
        const index = this.places.size;
        this.places.set(id, index);
        this.reversePlaces[index] = id;
        this.initialState[index] = tokens;
    }

    addTransition(id: string, name: string): void {
        const index = this.transitions.size;
        this.transitions.set(id, index);
        this.reverseTransitions[index] = id;
        this.pre[index] = [];
        this.post[index] = [];
    }

    addArc(source: string, target: string, weight: number): void {
        const sourceIndex = this.places.has(source) ? this.places.get(source) : this.transitions.get(source);
        const targetIndex = this.places.has(target) ? this.places.get(target) : this.transitions.get(target);

        if (sourceIndex === undefined || targetIndex === undefined) {
            throw new Error("Invalid arc: source and target must be either a place and a transition or vice versa.");
        }

        if (this.transitions.has(source)) {
            this.post[sourceIndex].push([targetIndex, weight]);
        } else if (this.transitions.has(target)) {
            this.pre[targetIndex].push([sourceIndex, weight]);
        } else {
            throw new Error("Invalid arc: source and target must be either a place and a transition or vice versa.");
        }
        console.log('Arc added:', source, target, weight);
    }

    renamePlace(oldId: string, newId: string): boolean {
        if (this.places.has(newId)) {
            return false;
        }
        if (!this.places.has(oldId)) {
            throw new Error(`Place ${oldId} does not exist.`);
        }
        const index = this.places.get(oldId)!;
        this.places.delete(oldId);
        this.places.set(newId, index);
        this.reversePlaces[index] = newId;
        return true;
    }

    renameTransition(oldId: string, newId: string): boolean {
        if (this.transitions.has(newId)) {
            return false;
        }
        if (!this.transitions.has(oldId)) {
            throw new Error(`Transition ${oldId} does not exist.`);
        }
        const index = this.transitions.get(oldId)!;
        this.transitions.delete(oldId);
        this.transitions.set(newId, index);
        this.reverseTransitions[index] = newId;
        return true;
    }

    updateWeight(source: string, target: string, newWeight: number): void {
        const sourceIndex = this.places.has(source) ? this.places.get(source) : this.transitions.get(source);
        const targetIndex = this.places.has(target) ? this.places.get(target) : this.transitions.get(target);

        if (sourceIndex === undefined || targetIndex === undefined) {
            throw new Error("Invalid arc: source and target must be either a place and a transition or vice versa.");
        }

        if (this.transitions.has(source)) {
            const arc = this.post[sourceIndex].find(([idx]) => idx === targetIndex);
            if (arc) arc[1] = newWeight;
        } else if (this.transitions.has(target)) {
            const arc = this.pre[targetIndex].find(([idx]) => idx === sourceIndex);
            if (arc) arc[1] = newWeight;
        } else {
            throw new Error("Invalid arc: source and target must be either a place and a transition or vice versa.");
        }
    }

    updateInitialState(placeId: string, newTokens: number): void {
        const placeIndex = this.places.get(placeId);
        if (placeIndex !== undefined) {
            this.initialState[placeIndex] = newTokens;
        } else {
            throw new Error(`Place with ID ${placeId} does not exist.`);
        }
    }

    deleteArc(source: string, target: string): void {
        const sourceIndex = this.places.has(source) ? this.places.get(source) : this.transitions.get(source);
        const targetIndex = this.places.has(target) ? this.places.get(target) : this.transitions.get(target);

        if (sourceIndex === undefined || targetIndex === undefined) {
            throw new Error("Invalid arc: source and target must be either a place and a transition or vice versa.");
        }

        if (this.transitions.has(source)) {
            this.post[sourceIndex] = this.post[sourceIndex].filter(([idx]) => idx !== targetIndex);
        } else if (this.transitions.has(target)) {
            this.pre[targetIndex] = this.pre[targetIndex].filter(([idx]) => idx !== sourceIndex);
        } else {
            throw new Error("Invalid arc: source and target must be either a place and a transition or vice versa.");
        }
    }

    deletePlace(id: string): void {
        if (!this.places.has(id)) throw new Error(`Place ${id} does not exist.`);
        const index = this.places.get(id)!;
        this.places.delete(id);
        this.reversePlaces.splice(index, 1);
        this.initialState.splice(index, 1);

        this.pre = this.pre.map(arcs => arcs.filter(([idx]) => idx !== index).map(([idx, weight]) => [idx > index ? idx - 1 : idx, weight]));
        this.post = this.post.map(arcs => arcs.filter(([idx]) => idx !== index).map(([idx, weight]) => [idx > index ? idx - 1 : idx, weight]));

        this.places.forEach((value, key) => {
            if (value > index) {
                this.places.set(key, value - 1);
            }
        });
    }

    deleteTransition(id: string): void {
        if (!this.transitions.has(id)) throw new Error(`Transition ${id} does not exist.`);
        const index = this.transitions.get(id)!;
        this.transitions.delete(id);
        this.reverseTransitions.splice(index, 1);
        this.pre.splice(index, 1);
        this.post.splice(index, 1);
    }

    isEnabled(state: number[], transitionId: string): boolean {
        const transitionIndex = this.transitions.get(transitionId)!;
        return this.pre[transitionIndex].every(([placeIndex, weight]) => state[placeIndex] >= weight);
    }

    getEnabledTransitions(state: number[]): string[] {
        const enabledTransitions: string[] = [];
        this.transitions.forEach((index, id) => {
            if (this.isEnabled(state, id)) {
                enabledTransitions.push(id);
            }
        });
        return enabledTransitions;
    }

    fireTransition(state: number[], transitionId: string): number[] {
        if (!this.isEnabled(state, transitionId)) {
            throw new Error(`Transition ${transitionId} is not enabled.`);
        }

        const transitionIndex = this.transitions.get(transitionId)!;
        const newState = state.slice();

        this.pre[transitionIndex].forEach(([placeIndex, weight]) => {
            newState[placeIndex] -= weight;
        });

        this.post[transitionIndex].forEach(([placeIndex, weight]) => {
            newState[placeIndex] += weight;
        });

        return newState;
    }

    getArcs(): [string, string, number][] {
        const arcs: [string, string, number][] = [];
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

    getGraphics(): Graphics {
        return this.graphics;
    }

    reorder(): void {
        // Compute permutations for places and transitions
        const placeIds = this.reversePlaces.slice();
        const transitionIds = this.reverseTransitions.slice();
        const Pperm = computePermutation(placeIds);
        const Tperm = computePermutation(transitionIds);

        // Reorder places
        const newPlaces = new Map<string, number>();
        const newReversePlaces = new Array<string>(this.reversePlaces.length);
        const newInitialState = new Array<number>(this.initialState.length);

        Pperm.forEach((newIndex, oldIndex) => {
            const id = this.reversePlaces[oldIndex];
            newPlaces.set(id, newIndex);
            newReversePlaces[newIndex] = id;
            newInitialState[newIndex] = this.initialState[oldIndex];
        });

        this.places = newPlaces;
        this.reversePlaces = newReversePlaces;
        this.initialState = newInitialState;

        // Reorder transitions
        const newTransitions = new Map<string, number>();
        const newReverseTransitions = new Array<string>(this.reverseTransitions.length);
        const newPre = new Array<Arc[]>(this.pre.length);
        const newPost = new Array<Arc[]>(this.post.length);

        Tperm.forEach((newIndex, oldIndex) => {
            const id = this.reverseTransitions[oldIndex];
            newTransitions.set(id, newIndex);
            newReverseTransitions[newIndex] = id;
            newPre[newIndex] = this.pre[oldIndex].map(([placeIndex, weight]) => [Pperm[placeIndex], weight]);
            newPost[newIndex] = this.post[oldIndex].map(([placeIndex, weight]) => [Pperm[placeIndex], weight]);
        });

        this.transitions = newTransitions;
        this.reverseTransitions = newReverseTransitions;
        this.pre = newPre;
        this.post = newPost;
    }
}

export { PetriNet };
