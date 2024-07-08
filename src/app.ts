import ViewMode from './viewMode';
import EditMode from './editMode';
import SimulationMode from './simulationMode';
import AnalysisMode from './analysisMode';
import PropertyMode from './propertyMode';
import BooleanExpressionEditor from './booleanExpressionEditor';
import {SharedState } from './sharedState';
import LayoutHandler from './layoutHandler';
import { buildExample } from './example';

type Mode = ViewMode | EditMode | SimulationMode | AnalysisMode | PropertyMode;

let currentMode: Mode | null = null;

const sharedState: SharedState = {
        petriNet: buildExample()
    };

const viewMode = new ViewMode(sharedState);
const editMode = new EditMode(sharedState);
const simulationMode = new SimulationMode(sharedState);
const booleanExpressionEditor = new BooleanExpressionEditor(sharedState);
const analysisMode = new AnalysisMode(sharedState, booleanExpressionEditor);
const propertyMode = new PropertyMode(sharedState);
const layoutHandler = new LayoutHandler();

document.addEventListener('DOMContentLoaded', () => {
    currentMode = viewMode;

    layoutHandler.setCurrentMode(currentMode);

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            const tabName = target.getAttribute('data-tab');
            if (tabName) {
                switchTab(tabName);
            }
        });
    });

    // Ensure the viewer tab is visible by default
    switchTab('viewer');

    requestAnimationFrame(() => {
        viewMode.activate();
        viewMode.layout('cose');
    });
});

function switchTab(tabName: string) {
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
        if (currentMode) {
            layoutHandler.setCurrentMode(currentMode);
            currentMode.activate();
        }
    });
}

function updateTabContent(tabName: string) {
    const tabs = document.getElementsByClassName('tab-content') as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].style.display = 'none';
    }
    const tabContent = document.getElementById(tabName);
    if (tabContent) {
        tabContent.style.display = 'block';
    }
}
