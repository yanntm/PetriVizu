// simulationMode

import AbstractMode from './abstractMode';
import { createCytoscapeElements,  } from './cytoscapeUtils';
import Trace from './trace';
import StateGraphView from './stateGraphView';

export default class SimulationMode extends AbstractMode {
    constructor(sharedState, stateGraphView) {
        super(sharedState, 'simulation-cy');
        this.stateGraphView = new StateGraphView('state-graph-cy', this.sharedState);
        this.currentState = this.sharedState.petriNet.initialState.slice();
        this.currentEnabled = [];
        this.trace = new Trace();
        this.setupEventListeners();
        this.setupStateGraphListener();
    }

    activate() {
        this.stateGraphView.clear();
        this.currentState = this.sharedState.petriNet.initialState.slice();
        updateCytoscapeCommon(this.cy, this.sharedState.petriNet, false);
        this.updateCytoShownState();
        this.updateEnabled();
        this.updateCurrentStateDisplay();
        this.updateTraceDisplay();
        this.stateGraphView.updateCurrentState(this.currentState); // Update state graph view
        this.cy.fit();
        
        requestAnimationFrame(() => {
          this.cy.fit();
          this.stateGraphView.applyLayout('dagre');
         }); 
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
    
    setupStateGraphListener() {
        this.stateGraphView.addStateClickListener((state) => {
            this.jumpToState(state);
        });
    }

    jumpToState(state) {
        this.trace.clear();
        this.currentState = state;
        this.updateCytoShownState();
        this.updateEnabled();
        this.updateCurrentStateDisplay();
        this.updateTraceDisplay();
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
    
        this.sharedState.petriNet.reverseTransitions.forEach(transitionId => {
            if (this.currentEnabled.includes(transitionId)) {
                const transitionItem = document.createElement('div');
                transitionItem.innerText = transitionId;
                transitionItem.style.cursor = 'pointer';
                transitionItem.addEventListener('click', () => {
                    this.fireTransition(transitionId);
                });
                enabledTransitionsDiv.appendChild(transitionItem);
            }
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
        this.sharedState.petriNet.reversePlaces.forEach(placeId => {
            const placeIndex = this.sharedState.petriNet.places.get(placeId);
            stateText += `${placeId}: ${this.currentState[placeIndex]}\n`;
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
        const previousState = this.currentState;
        this.currentState = this.sharedState.petriNet.fireTransition(this.currentState, transitionId);
        this.trace.addTransition(transitionId);
        this.stateGraphView.updateCurrentState(this.currentState);
        const sourceStateId = this.stateGraphView.stateGraph.getId(previousState);
        const destinationStateId = this.stateGraphView.stateGraph.getId(this.currentState);
        
        this.stateGraphView.updateCurrentState(this.currentState);
        this.updateCytoShownState();
        this.updateEnabled();
        this.updateCurrentStateDisplay();
        this.updateTraceDisplay();
    }

    resetSimulation() {
        this.currentState = this.sharedState.petriNet.initialState.slice();
        this.trace.clear();
        this.stateGraphView.updateCurrentState(this.currentState);
        this.updateCytoShownState();
        this.updateEnabled();
        this.updateCurrentStateDisplay();
        this.updateTraceDisplay();
    }
}

function updateCytoscapeCommon(cy, petriNet, showAllLabels = false) {
  const elements = createCytoscapeElements(petriNet, { showAllLabels });
  cy.elements().remove();
  cy.add(elements);
}

export { SimulationMode };
