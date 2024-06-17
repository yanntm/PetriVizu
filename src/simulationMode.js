import cytoscape from 'cytoscape';
import cytoscapeStyles from './cytoscapeStyles.js';
import { createCytoscapeElements } from './cytoscapeUtils.js';
import Trace from './trace.js';

let simulationCy;
let currentState;
let currentEnabled = [];
let petriNet;
let trace = new Trace();

function enterSimulationMode(existingNet) {
	petriNet = existingNet || new PetriNet();
	currentState = petriNet.initialState.slice(); // Copy initial state

	simulationCy = initCytoscape(petriNet, 'simulation-cy');
	updateCytoShownState(simulationCy, petriNet, currentState);
	updateEnabled(currentState, petriNet);
	updateCurrentStateDisplay(currentState, petriNet);
	updateTraceDisplay();

	simulationCy.on('tap', 'node.transition', function(event) {
		const transitionId = event.target.id();
		if (currentEnabled.includes(transitionId)) {
			fireTransition(transitionId);
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
	const enabledTransitionsDiv = document.getElementById('enabled-transitions');
	enabledTransitionsDiv.innerHTML = "";

	currentEnabled.forEach(transitionId => {
		const transitionName = transitionId;
		const transitionItem = document.createElement('div');
		transitionItem.innerText = transitionName;
		transitionItem.style.cursor = 'pointer';
		transitionItem.addEventListener('click', () => {
			fireTransition(transitionId);
		});
		enabledTransitionsDiv.appendChild(transitionItem);
	});

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

function updateCurrentStateDisplay(state, petriNet) {
	const currentStateTextarea = document.getElementById('current-state');
	let stateText = "";
	petriNet.places.forEach((index, placeId) => {
		stateText += `${placeId}: ${state[index]}\n`;
	});
	currentStateTextarea.value = stateText;
}

function updateTraceDisplay() {
	const traceDiv = document.getElementById('trace');
	traceDiv.innerHTML = "";

	trace.getTransitions().forEach(transitionId => {
		const transitionItem = document.createElement('div');
		transitionItem.innerText = transitionId;
		traceDiv.appendChild(transitionItem);
	});
}

function fireTransition(transitionId) {
	currentState = petriNet.fireTransition(currentState, transitionId);
	trace.addTransition(transitionId);
	updateCytoShownState(simulationCy, petriNet, currentState);
	updateEnabled(currentState, petriNet);
	updateCurrentStateDisplay(currentState, petriNet);
	updateTraceDisplay();
}

function resetSimulation() {
	currentState = petriNet.initialState.slice();
	trace.clear();
	updateCytoShownState(simulationCy, petriNet, currentState);
	updateEnabled(currentState, petriNet);
	updateCurrentStateDisplay(currentState, petriNet);
	updateTraceDisplay();
}

export { enterSimulationMode };
