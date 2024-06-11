import { PetriNet } from './petriNetModel.js';

export function buildExample() {
    const exampleNet = new PetriNet();

    exampleNet.addPlace('A', 'A', 1);
    exampleNet.addPlace('B', 'B', 0);
    exampleNet.addTransition('T1', 'T1');
    exampleNet.addArc('A', 'T1', 1);
    exampleNet.addArc('T1', 'B', 1);

    return exampleNet;
}
