import cytoscape from 'cytoscape';
import cytoscapeStyles from './cytoscapeStyles.js';
import { createCytoscapeElements } from './cytoscapeUtils.js';

let simulationCy;
let currentState;
let currentEnabled = [];
let petriNet;

function enterSimulationMode(existingNet) {
    petriNet = existingNet || new PetriNet();
    currentState = petriNet.initialState.slice(); // Copy initial state

    simulationCy = initCytoscape(petriNet, 'simulation-cy');
    updateCytoShownState(simulationCy, petriNet, currentState);
    updateEnabled(currentState, petriNet);

    simulationCy.on('tap', 'node.transition', function(event) {
        const transitionId = event.target.id();
        if (currentEnabled.includes(transitionId)) {
            currentState = petriNet.fireTransition(currentState, transitionId);
            updateCytoShownState(simulationCy, petriNet, currentState);
            updateEnabled(currentState, petriNet);
        }
    });

    document.getElementById('reset').addEventListener('click', resetSimulation);
}

function initCytoscape(petriNet, containerId) {
    const cy = cytoscape({
        container: document.getElementById(containerId),
        style: cytoscapeStyles,
        layout: { name: 'cose', padding: 10 }
    });

    const elements = createCytoscapeElements(petriNet, { showAllLabels: true });
    cy.add(elements);

    cy.layout({ name: 'cose', padding: 10 }).run().promiseOn('layoutstop').then(() => {
        cy.fit();
    });

    return cy;
}

function updateCytoShownState(cy, petriNet, state) {
    cy.nodes().forEach(node => {
        if (node.hasClass('place')) {
            const placeId = node.data('id');
            const placeIndex = petriNet.places.get(placeId);
            const marking = state[placeIndex];
            const labelParts = node.data('label').split('\n');
            const name = labelParts[0];
            node.data('label', `${name}\n${marking}`);
        }
    });
}

function updateEnabled(state, petriNet) {
    currentEnabled = petriNet.getEnabledTransitions(state);
    simulationCy.nodes().forEach(node => {
        if (node.hasClass('transition')) {
            if (currentEnabled.includes(node.id())) {
                node.style('background-color', 'green');
            } else {
                node.style('background-color', 'grey');
            }
        }
    });
}

function resetSimulation() {
    currentState = petriNet.initialState.slice();
    updateCytoShownState(simulationCy, petriNet, currentState);
    updateEnabled(currentState, petriNet);
}

export { enterSimulationMode };
