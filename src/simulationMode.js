import Mode from './modeInterface.js';
import cytoscape from 'cytoscape';
import cytoscapeStyles from './cytoscapeStyles.js';

import { createCytoscapeElements, syncGraphicsFromCy, initCytoscape } from './cytoscapeUtils.js';
import Trace from './trace.js';

export default class SimulationMode extends Mode {
  constructor(sharedState) {
    super();
    this.sharedState = sharedState;
    this.cy = initCytoscape('simulation-cy');
    this.currentState = this.sharedState.petriNet.initialState.slice();
    this.currentEnabled = [];
    this.trace = new Trace();
    this.setupEventListeners();
  }

  activate() {
    this.currentState = this.sharedState.petriNet.initialState.slice();
    updateCytoscapeCommon(this.cy, this.sharedState.petriNet, true);
    this.updateCytoShownState();
    this.updateEnabled();
    this.updateCurrentStateDisplay();
    this.updateTraceDisplay();
    this.cy.fit();
  }

  deactivate() {
    syncGraphicsFromCy(this.cy, this.sharedState.petriNet);
  }

  setSharedState(sharedState) {
    this.sharedState = sharedState;
    this.currentState = this.sharedState.petriNet.initialState.slice();
  }

  setupEventListeners() {
    this.cy.on('tap', 'node.transition', (event) => {
      const transitionId = event.target.id();
      if (this.currentEnabled.includes(transitionId)) {
        this.fireTransition(transitionId);
      }
    });

    document.getElementById('reset').addEventListener('click', () => this.resetSimulation());
  }

  updateCytoShownState() {
    this.cy.nodes().forEach(node => {
      if (node.hasClass('place')) {
        const placeId = node.data('id');
        const placeIndex = this.sharedState.petriNet.places.get(placeId);
        const marking = this.currentState[placeIndex];
        const labelParts = node.data('label').split('\n');
        const name = labelParts[0];
        node.data('label', `${name}\n${marking}`);
      }
    });
  }

  updateEnabled() {
    this.currentEnabled = this.sharedState.petriNet.getEnabledTransitions(this.currentState);
    const enabledTransitionsDiv = document.getElementById('enabled-transitions');
    enabledTransitionsDiv.innerHTML = "";

    this.currentEnabled.forEach(transitionId => {
      const transitionItem = document.createElement('div');
      transitionItem.innerText = transitionId;
      transitionItem.style.cursor = 'pointer';
      transitionItem.addEventListener('click', () => {
        this.fireTransition(transitionId);
      });
      enabledTransitionsDiv.appendChild(transitionItem);
    });

    this.cy.nodes().forEach(node => {
      if (node.hasClass('transition')) {
        if (this.currentEnabled.includes(node.id())) {
          node.style('background-color', 'green');
        } else {
          node.style('background-color', 'grey');
        }
      }
    });
  }

  updateCurrentStateDisplay() {
    const currentStateTextarea = document.getElementById('current-state');
    let stateText = "";
    this.sharedState.petriNet.places.forEach((index, placeId) => {
      stateText += `${placeId}: ${this.currentState[index]}\n`;
    });
    currentStateTextarea.value = stateText;
  }

  updateTraceDisplay() {
    const traceDiv = document.getElementById('trace');
    traceDiv.innerHTML = "";

    this.trace.getTransitions().forEach(transitionId => {
      const transitionItem = document.createElement('div');
      transitionItem.innerText = transitionId;
      traceDiv.appendChild(transitionItem);
    });
  }

  fireTransition(transitionId) {
    this.currentState = this.sharedState.petriNet.fireTransition(this.currentState, transitionId);
    this.trace.addTransition(transitionId);
    this.updateCytoShownState();
    this.updateEnabled();
    this.updateCurrentStateDisplay();
    this.updateTraceDisplay();
  }

  resetSimulation() {
    this.currentState = this.sharedState.petriNet.initialState.slice();
    this.trace.clear();
    this.updateCytoShownState();
    this.updateEnabled();
    this.updateCurrentStateDisplay();
    this.updateTraceDisplay();
  }
}
/*
function initCytoscape(petriNet, containerId) {
  const cy = cytoscape({
    container: document.getElementById(containerId),
    style: cytoscapeStyles,
    layout: { name: 'preset', padding: 10 }
  });

  const elements = createCytoscapeElements(petriNet, { showAllLabels: true });
  cy.add(elements);

  return cy;
}*/

function updateCytoscapeCommon(cy, petriNet, showAllLabels = false) {
  const elements = createCytoscapeElements(petriNet, { showAllLabels });
  cy.elements().remove();
  cy.add(elements);
}

export { SimulationMode };
