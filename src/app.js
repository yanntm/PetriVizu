import ViewMode from './viewMode.js';
import EditMode from './editMode.js';
import SimulationMode from './simulationMode.js';
import AnalysisMode from './analysisMode.js';
import PropertyMode from './propertyMode.js';
import BooleanExpressionEditor from './booleanExpressionEditor.js';
import { buildExample } from './example.js';
import LayoutHandler from './layoutHandler.js';

let currentMode;
const sharedState = {
    petriNet: buildExample()
};

const viewMode = new ViewMode(sharedState);
const editMode = new EditMode(sharedState);
const simulationMode = new SimulationMode(sharedState);
const analysisMode = new AnalysisMode(sharedState);
const propertyMode = new PropertyMode(sharedState);
const booleanExpressionEditor = new BooleanExpressionEditor(sharedState);
const layoutHandler = new LayoutHandler();

document.addEventListener('DOMContentLoaded', () => {
    currentMode = viewMode;
    
    layoutHandler.setCurrentMode(currentMode);

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const tabName = event.target.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Ensure the viewer tab is visible by default
    switchTab('viewer');
    
    requestAnimationFrame(() => {
        viewMode.activate();
        viewMode.layout('cose');
    });
});

function switchTab(tabName) {
    if (currentMode) {
        currentMode.deactivate();
    }
    updateTabContent(tabName);

    if (tabName === 'editor') {
        currentMode = editMode;
    } else if (tabName === 'viewer') {
        currentMode = viewMode;
    } else if (tabName === 'simulation') {
        currentMode = simulationMode;
    } else if (tabName === 'analysis') {
        currentMode = analysisMode;
    } else if (tabName === 'property') {
        currentMode = propertyMode;
    }
    
    requestAnimationFrame(() => {
        layoutHandler.setCurrentMode(currentMode);
        currentMode.activate();        
    });
}

function updateTabContent(tabName) {
    const tabs = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].style.display = 'none';
    }
    document.getElementById(tabName).style.display = 'block';
}
