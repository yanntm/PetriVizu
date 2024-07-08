import { PetriNet, NodeType } from './petriNetModel';

function reorderNet(pnori: PetriNet): PetriNet {
    const pnres = new PetriNet();

    // Step 2: Grab place names from original net and sort them
    const sortedPlaceNames = pnori.placeNames.slice().sort(alphanumericSort);

    // Step 3: Add places to pnres in sorted order
    for (const placeId of sortedPlaceNames) {
        const node = pnori.nodes.get(placeId);
        if (node) {
            pnres.addPlace(node.id, pnori.initialState[node.index]);
            pnres.setPosition(node.id, pnori.getPosition(node.id)); // Copy position
        }
    }

    // Step 4: Grab transition names, sort them, and add to pnres in sorted order
    const sortedTransNames = pnori.transNames.slice().sort(alphanumericSort);

    for (const transId of sortedTransNames) {
        const node = pnori.nodes.get(transId);
        if (node) {
            pnres.addTransition(node.id);
            pnres.setPosition(node.id, pnori.getPosition(node.id)); // Copy position
        }
    }

    // Step 5: Iterate all arcs and add them to pnres
    for (const [sourceId, targetId, weight] of pnori.getArcs()) {
        pnres.addArc(sourceId, targetId, weight);
    }

    return pnres;
}

// Helper function: alphanumericSort
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

export { reorderNet };
