import ViewMode from './viewMode.js';
import EditMode from './editMode.js';
import SimulationMode from './simulationMode.js';
import { buildExample } from './example.js';

let currentMode;
const sharedState = {
    petriNet: buildExample()
};

const viewMode = new ViewMode(sharedState);
const editMode = new EditMode(sharedState);
const simulationMode = new SimulationMode(sharedState);

document.addEventListener('DOMContentLoaded', () => {
    currentMode = viewMode;
    currentMode.activate();

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const tabName = event.target.getAttribute('onclick').match(/openTab\('([^']+)'\)/)[1];
            switchTab(tabName);
        });
    });
});

function switchTab(tabName) {
    if (currentMode) {
        currentMode.deactivate();
    }

    if (tabName === 'editor') {
        currentMode = editMode;
    } else if (tabName === 'viewer') {
        currentMode = viewMode;
    } else if (tabName === 'simulation') {
        currentMode = simulationMode;
    }

    updateTabContent(tabName);
    currentMode.activate();
}

function updateTabContent(tabName) {
    const tabs = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].style.display = 'none';
    }
    document.getElementById(tabName).style.display = 'block';
}
