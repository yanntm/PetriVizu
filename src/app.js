import { loadPetriNet } from './loader.js';
import { initCytoscape, updateCytoscape } from './viewMode.js';
import { buildExample } from './example.js';
import { enterEditMode } from './editMode.js';
import { enterSimulationMode } from './simulationMode.js';

let viewerCy;
let editorCy;
let simulationCy;
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
                    updateCytoscape(editorCy, petriNet);
                }
                // Update simulation too if already initialized
                if (simulationCy) {
                    enterSimulationMode(petriNet); // Re-enter simulation mode to reset state
                }
            };
            reader.readAsText(file);
        }
    });

    // Initialize Editor tab
    document.querySelector('.tab-button[onclick="openTab(\'editor\')"]').addEventListener('click', () => {
        if (!editorCy) {
            editorCy = enterEditMode(petriNet);
        } else {
            updateCytoscape(editorCy, petriNet);
        }
    });

    // Initialize Simulation tab
    document.querySelector('.tab-button[onclick="openTab(\'simulation\')"]').addEventListener('click', () => {
        if (!simulationCy) {
            simulationCy = initCytoscape(petriNet, 'simulation-cy');
            enterSimulationMode(petriNet);
        } else {
            updateCytoscape(simulationCy, petriNet);
        }
    });

    // Handle tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const tabName = event.target.getAttribute('onclick').match(/openTab\('([^']+)'\)/)[1];
            openTab(tabName);
        });
    });
});

function openTab(tabName) {
    const tabs = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].style.display = 'none';
    }
    document.getElementById(tabName).style.display = 'block';

    if (tabName === 'editor') {
        if (!editorCy) {
            editorCy = enterEditMode(petriNet);
        } else {
            updateCytoscape(editorCy, petriNet);
        }
    } else if (tabName === 'viewer') {
        updateCytoscape(viewerCy, petriNet);
    } else if (tabName === 'simulation') {
        if (!simulationCy) {
            simulationCy = initCytoscape(petriNet, 'simulation-cy');
            enterSimulationMode(petriNet);
        } else {
            updateCytoscape(simulationCy, petriNet);
        }
    }
}
