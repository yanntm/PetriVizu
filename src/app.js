import { loadPetriNet } from './loader.js';
import { initCytoscape, updateCytoscape } from './cytoscapeIntegration.js';
import { buildExample } from './example.js';
import { enterEditMode } from './editMode.js';

let viewerCy;
let editorCy;
let petriNet;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Viewer with an example Petri net
    petriNet = buildExample();
    viewerCy = initCytoscape(petriNet, 'viewer-cy');
    updateCytoscape(viewerCy, petriNet);

    document.getElementById('fileOpen').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                petriNet = loadPetriNet(content);
                updateCytoscape(viewerCy, petriNet);
                // Update editor too if already initialized
                if (editorCy) {
                    enterEditMode(petriNet);
                }
            };
            reader.readAsText(file);
        }
    });

    // Initialize Editor tab
    document.querySelector('.tab-button[onclick="openTab(\'editor\')"]').addEventListener('click', () => {
        if (!editorCy) {
            enterEditMode(petriNet);
        }
    });
});

function openTab(tabName) {
    const tabs = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].style.display = 'none';
    }
    document.getElementById(tabName).style.display = 'block';

    if (tabName === 'editor' && !editorCy) {
        enterEditMode(petriNet);
    }
}
