import { PetriNet } from './petriNetModel';

export function exportToPNMLContent(petriNet: PetriNet): string {
    const xmlParts: string[] = [];
    let arcIndex = 0; // Initialize arc index counter

    xmlParts.push('<?xml version="1.0" encoding="utf-8"?>');
    xmlParts.push('<pnml xmlns="http://www.pnml.org/version-2009/grammar/pnml">');
    xmlParts.push('<net id="flowdef" type="http://www.pnml.org/version-2009/grammar/ptnet">');
    xmlParts.push('<page id="page0">');
    xmlParts.push('<name><text>DefaultPage</text></name>');

    // Export places
    petriNet.placeNames.forEach(id => {
        const node = petriNet.getNode(id);
        const tokens = petriNet.initialState[node.index];
        xmlParts.push(`<place id="${id}">`);
        xmlParts.push(`<name><text>${id}</text></name>`);
        if (tokens > 0) {
            xmlParts.push(`<initialMarking><text>${tokens}</text></initialMarking>`);
        }
        xmlParts.push('</place>');
    });

    // Export transitions and their related arcs
    petriNet.transNames.forEach(id => {
        const node = petriNet.getNode(id);
        xmlParts.push(`<transition id="${id}">`);
        xmlParts.push(`<name><text>${id}</text></name>`);
        xmlParts.push('</transition>');

        // Export arcs related to this transition
        petriNet.pre[node.index].forEach(arc => {
            const placeId = petriNet.placeNames[arc.placeIndex];
            xmlParts.push(`<arc id="a${arcIndex++}" source="${placeId}" target="${id}">`);
            if (arc.weight > 1) {
                xmlParts.push(`<inscription><text>${arc.weight}</text></inscription>`);
            }
            xmlParts.push('</arc>');
        });
        petriNet.post[node.index].forEach(arc => {
            const placeId = petriNet.placeNames[arc.placeIndex];
            xmlParts.push(`<arc id="a${arcIndex++}" source="${id}" target="${placeId}">`);
            if (arc.weight > 1) {
                xmlParts.push(`<inscription><text>${arc.weight}</text></inscription>`);
            }
            xmlParts.push('</arc>');
        });
    });

    xmlParts.push('</page>');
    xmlParts.push('<name><text>flowdef</text></name>');
    xmlParts.push('</net>');
    xmlParts.push('</pnml>');

    return xmlParts.join('\n');
}

export function exportToPNML(petriNet: PetriNet): void {
    const xmlContent = exportToPNMLContent(petriNet);
    downloadPNML(xmlContent);
}

function downloadPNML(content: string): void {
    const blob = new Blob([content], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'petri_net.pnml';
    a.click();
    URL.revokeObjectURL(url);
}
