import { Graphics } from './graphics.js';

function alphanumericSort(a, b) {
    const regex = /(.*?)(\d+)?$/;
    const aMatch = a.match(regex);
    const bMatch = b.match(regex);

    const aPrefix = aMatch[1] || '';
    const bPrefix = bMatch[1] || '';
    const aNumber = aMatch[2] ? parseInt(aMatch[2], 10) : 0;
    const bNumber = bMatch[2] ? parseInt(bMatch[2], 10) : 0;

    if (aPrefix < bPrefix) return -1;
    if (aPrefix > bPrefix) return 1;
    return aNumber - bNumber;
}

function computePermutation(ids) {
    // Create a permutation array with the same length as ids
    const perm = ids.map((id, index) => index);

    // Sort the perm array based on the ids using the alphanumericSort function
    perm.sort((a, b) => alphanumericSort(ids[a], ids[b]));
    // Generate the permutation vector
    const permutation = new Array(perm.length);
    perm.forEach((sortedIndex, originalIndex) => {
        permutation[sortedIndex] = originalIndex;
    });
    return permutation;
}


class PetriNet {
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
    console.log('Arc added:', source, target, weight);

  }

renamePlace(oldId, newId) {
    if (this.places.has(newId)) {
        return false; // Name already used
    }
    if (!this.places.has(oldId)) {
        throw new Error(`Place ${oldId} does not exist.`);
    }
    const index = this.places.get(oldId);
    this.places.delete(oldId);
    this.places.set(newId, index);
    this.reversePlaces[index] = newId;
    return true;
}

renameTransition(oldId, newId) {
    if (this.transitions.has(newId)) {
        return false; // Name already used
    }
    if (!this.transitions.has(oldId)) {
        throw new Error(`Transition ${oldId} does not exist.`);
    }
    const index = this.transitions.get(oldId);
    this.transitions.delete(oldId);
    this.transitions.set(newId, index);
    this.reverseTransitions[index] = newId;
    return true;
}

  updateWeight(source, target, newWeight) {
    const sourceIndex = this.places.has(source) ? this.places.get(source) : this.transitions.get(source);
    const targetIndex = this.places.has(target) ? this.places.get(target) : this.transitions.get(target);

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

  updateInitialState(placeId, newTokens) {
    const placeIndex = this.places.get(placeId);
    if (placeIndex !== undefined) {
      this.initialState[placeIndex] = newTokens;
    } else {
      throw new Error(`Place with ID ${placeId} does not exist.`);
    }
  }

  deleteArc(source, target) {
    const sourceIndex = this.places.has(source) ? this.places.get(source) : this.transitions.get(source);
    const targetIndex = this.places.has(target) ? this.places.get(target) : this.transitions.get(target);

    if (this.transitions.has(source)) {
      this.post[sourceIndex] = this.post[sourceIndex].filter(([idx]) => idx !== targetIndex);
    } else if (this.transitions.has(target)) {
      this.pre[targetIndex] = this.pre[targetIndex].filter(([idx]) => idx !== sourceIndex);
    } else {
      throw new Error("Invalid arc: source and target must be either a place and a transition or vice versa.");
    }
  }

  deletePlace(id) {
    if (!this.places.has(id)) throw new Error(`Place ${id} does not exist.`);
    const index = this.places.get(id);
    this.places.delete(id);
    this.reversePlaces.splice(index, 1);
    this.initialState.splice(index, 1);

    // Update arcs
    this.pre = this.pre.map(arcs => arcs.filter(([idx]) => idx !== index).map(([idx, weight]) => [idx > index ? idx - 1 : idx, weight]));
    this.post = this.post.map(arcs => arcs.filter(([idx]) => idx !== index).map(([idx, weight]) => [idx > index ? idx - 1 : idx, weight]));

    // Update indexes
    this.places.forEach((value, key) => {
      if (value > index) {
        this.places.set(key, value - 1);
      }
    });
  }

  deleteTransition(id) {
    if (!this.transitions.has(id)) throw new Error(`Transition ${id} does not exist.`);
    const index = this.transitions.get(id);
    this.transitions.delete(id);
    this.reverseTransitions.splice(index, 1);
    this.pre.splice(index, 1);
    this.post.splice(index, 1);
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
  
  getGraphics() {
        return this.graphics;
  }
  
    reorder() {
        // Compute permutations for places and transitions
        const placeIds = this.reversePlaces.slice();
        const transitionIds = this.reverseTransitions.slice();
        const Pperm = computePermutation(placeIds);
        const Tperm = computePermutation(transitionIds);

        console.log('Original Place IDs:', placeIds);
        console.log('Permutation:', Pperm);

        // Reorder places
        const newPlaces = new Map();
        const newReversePlaces = new Array(this.reversePlaces.length);
        const newInitialState = new Array(this.initialState.length);

        Pperm.forEach((newIndex, oldIndex) => {
            const id = this.reversePlaces[oldIndex];
            newPlaces.set(id, newIndex);
            newReversePlaces[newIndex] = id;
            newInitialState[newIndex] = this.initialState[oldIndex];
        });

        this.places = newPlaces;
        this.reversePlaces = newReversePlaces;
        this.initialState = newInitialState;

        console.log('Final ids:', this.reversePlaces);

        // Reorder transitions
        const newTransitions = new Map();
        const newReverseTransitions = new Array(this.reverseTransitions.length);
        const newPre = new Array(this.pre.length);
        const newPost = new Array(this.post.length);

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
