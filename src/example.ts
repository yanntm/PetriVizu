import { PetriNet } from './petriNetModel';

export function buildExample() {
  const exampleNet = new PetriNet();

  exampleNet.addPlace('A', 1);
  exampleNet.addPlace('B',  1);
  exampleNet.addTransition('T1');
  exampleNet.addArc('A', 'T1', 1);
  exampleNet.addArc('T1', 'B', 1);

  exampleNet.addTransition('T2');
  exampleNet.addArc('B', 'T2', 2);
  exampleNet.addArc('T2', 'A', 2);

  return exampleNet;
}
