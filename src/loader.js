import { PetriNet } from './petriNetModel.js';

function loadPetriNet() {
    const petriNet = new PetriNet();

    // Example Petri net
    const place = ['A1', 'B1', 'A2', 'B2'];
    const trans = ['t1', 't2'];
    const pre = [[{ p: 0, w: 1 }, { p: 2, w: 1 }], [{ p: 0, w: 1 }, { p: 2, w: 1 }]];
    const post = [[{ p: 1, w: 1 }, { p: 2, w: 1 }], [{ p: 0, w: 1 }, { p: 3, w: 1 }]];
    const m0 = [1, 0, 1, 0];

    place.forEach((p, index) => petriNet.addPlace(`p${index}`, p, m0[index]));
    trans.forEach((t, index) => petriNet.addTransition(`t${index}`, t));

    pre.forEach((arcs, tIndex) => {
        arcs.forEach(arc => {
            petriNet.addArc(`p${arc.p}`, `t${tIndex}`, arc.w);
        });
    });

    post.forEach((arcs, tIndex) => {
        arcs.forEach(arc => {
            petriNet.addArc(`t${tIndex}`, `p${arc.p}`, arc.w);
        });
    });

    return petriNet;
}

export { loadPetriNet };
