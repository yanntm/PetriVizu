import { PetriNet, State, NodeType } from './petriNetModel';

class WalkUtils {
    private petriNet: PetriNet;

    constructor(petriNet: PetriNet) {
        this.petriNet = petriNet;
    }

    isEnabled(state: State, transitionId: string): boolean {
        const transition = this.petriNet.nodes.get(transitionId);
        if (!transition || transition.type !== NodeType.Transition) {
            throw new Error(`Transition ${transitionId} does not exist.`);
        }

        return this.petriNet.pre[transition.index].every(arc => state[arc.placeIndex] >= arc.weight);
    }

    getEnabledTransitions(state: State): string[] {
        const enabledTransitions: string[] = [];
        this.petriNet.nodes.forEach((node, id) => {
            if (node.type === NodeType.Transition && this.isEnabled(state, id)) {
                enabledTransitions.push(id);
            }
        });
        return enabledTransitions;
    }

    fireTransition(state: State, transitionId: string): State {
        if (!this.isEnabled(state, transitionId)) {
            throw new Error(`Transition ${transitionId} is not enabled.`);
        }

        const transition = this.petriNet.nodes.get(transitionId);
        if (!transition) {
            throw new Error(`Transition ${transitionId} does not exist.`);
        }

        const newState = state.slice(); // Copy the current state

        this.petriNet.pre[transition.index].forEach(arc => {
            newState[arc.placeIndex] -= arc.weight;
        });

        this.petriNet.post[transition.index].forEach(arc => {
            newState[arc.placeIndex] += arc.weight;
        });

        return newState;
    }
}

export { WalkUtils };
