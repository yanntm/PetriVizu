import cytoscape from 'cytoscape';
import { loadPetriNet } from './loader.js';
import { initCytoscape, updateCytoscape } from './cytoscapeIntegration.js';

document.addEventListener('DOMContentLoaded', () => {
    const petriNet = loadPetriNet();
    const cy = initCytoscape(petriNet);
    updateCytoscape(cy, petriNet);
});
