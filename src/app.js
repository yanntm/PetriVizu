import ViewMode from './viewMode.js';
import EditMode from './editMode.js';
import SimulationMode from './simulationMode.js';
import { buildExample } from './example.js';
import LayoutHandler from './layoutHandler.js';

let currentMode;
const sharedState = {
    petriNet: buildExample()
};

const viewMode = new ViewMode(sharedState);
const editMode = new EditMode(sharedState);
const simulationMode = new SimulationMode(sharedState);
const layoutHandler = new LayoutHandler();

document.addEventListener('DOMContentLoaded', () => {
    currentMode = viewMode;
    currentMode.activate();
    layoutHandler.setCurrentMode(currentMode);

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const tabName = event.target.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Ensure the viewer tab is visible by default
    switchTab('viewer');
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
    layoutHandler.setCurrentMode(currentMode);
}

function updateTabContent(tabName) {
    const tabs = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].style.display = 'none';
    }
    document.getElementById(tabName).style.display = 'block';
}
