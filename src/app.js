import { loadPetriNet } from './loader.js';
import { initCytoscape, updateCytoscape } from './cytoscapeIntegration.js';
import { buildExample } from './example.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Cytoscape with an example Petri net
    const exampleNet = buildExample();
    const cy = initCytoscape(exampleNet);
    updateCytoscape(cy, exampleNet);

    document.getElementById('fileOpen').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                const petriNet = loadPetriNet(content);
                updateCytoscape(cy, petriNet);
            };
            reader.readAsText(file);
        }
    });
});
