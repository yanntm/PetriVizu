// exporter.js
import { PetriNet } from './petriNetModel';

export function exportToPNMLContent(petriNet) {
    const xmlParts = [];

    xmlParts.push('<?xml version="1.0" encoding="utf-8"?>');
    xmlParts.push('<pnml xmlns="http://www.pnml.org/version-2009/grammar/pnml">');
    xmlParts.push('<net id="flowdef" type="http://www.pnml.org/version-2009/grammar/ptnet">');
    xmlParts.push('<page id="page0">');
    xmlParts.push('<name><text>DefaultPage</text></name>');

    petriNet.places.forEach((index, id) => {
        const tokens = petriNet.initialState[index];
        xmlParts.push(`<place id="${id}">`);
        xmlParts.push(`<name><text>${id}</text></name>`);
        if (tokens > 0) {
            xmlParts.push(`<initialMarking><text>${tokens}</text></initialMarking>`);
        }
        xmlParts.push('</place>');
    });

    petriNet.transitions.forEach((index, id) => {
        xmlParts.push(`<transition id="${id}">`);
        xmlParts.push(`<name><text>${id}</text></name>`);
        xmlParts.push('</transition>');
    });

    petriNet.getArcs().forEach(([sourceId, targetId, weight], index) => {
        xmlParts.push(`<arc id="arc${index}" source="${sourceId}" target="${targetId}">`);
        if (weight > 1) {
            xmlParts.push(`<inscription><text>${weight}</text></inscription>`);
        }
        xmlParts.push('</arc>');
    });

    xmlParts.push('</page>');
    xmlParts.push('<name><text>flowdef</text></name>');
    xmlParts.push('</net>');
    xmlParts.push('</pnml>');

    return xmlParts.join('\n');
}

export function exportToPNML(petriNet) {
    const xmlContent = exportToPNMLContent(petriNet);
    downloadPNML(xmlContent);
}

function downloadPNML(content) {
    const blob = new Blob([content], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'petri_net.pnml';
    a.click();
    URL.revokeObjectURL(url);
}
