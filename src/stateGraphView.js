// stateGraphView.js

import cytoscape from 'cytoscape';
import StateGraph from './stateGraph';

class StateGraphView {
    constructor(containerId, sharedState) {
        this.stateGraph = new StateGraph(sharedState.petriNet);
        this.sharedState = sharedState;
        this.cy = this.initCytoscape(containerId);
        this.exploredStates = new Set(); // Set to track explored states
        this.currentStateId = null; // Track the current state ID

        // Initialize the layout control
        this.initializeLayoutControl();
    }

    initCytoscape(containerId) {
        return cytoscape({
            container: document.getElementById(containerId),
            style: [
                {
                    selector: 'node',
                    style: {
                        'label': 'data(label)',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'background-color': 'data(color)',
                        'border-style': 'data(borderStyle)',
                        'border-width': '2px'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'label': 'data(label)',
                        'width': 2,
                        'line-color': '#9dbaea',
                        'target-arrow-color': '#9dbaea',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier'
                    }
                }
            ],
            layout: {
                name: 'grid',
                padding: 10
            }
        });
    }

    initializeLayoutControl() {
        const layoutDropdown = document.getElementById('layout-dropdown');
        layoutDropdown.addEventListener('change', () => {
            this.applyLayout(layoutDropdown.value);
        });
    }

    applyLayout(layoutName) {
        this.cy.layout({ name: layoutName, padding: 10 }).run();
    }

    addState(state) {
        const stateId = this.stateGraph.getId(state);
        const label = this.stateGraph.getStateLabel(stateId);
        this.cy.add({
            group: 'nodes',
            data: { 
                id: `state${stateId}`, 
                label, 
                color: stateId === this.currentStateId ? 'green' : 'white',
                borderStyle: this.exploredStates.has(stateId) ? 'solid' : 'dashed'
            }
        });
        this.applyLayout(document.getElementById('layout-dropdown').value); // Apply layout after adding state
    }

    addTransition(sourceId, destinationId, transitionId) {
        this.stateGraph.addEdge(sourceId, destinationId, transitionId);
        this.cy.add({
            group: 'edges',
            data: {
                id: `edge${sourceId}-${destinationId}`,
                source: `state${sourceId}`,
                target: `state${destinationId}`,
                label: transitionId
            }
        });
        this.applyLayout(document.getElementById('layout-dropdown').value); // Apply layout after adding transition
    }

    updateCurrentState(state) {
        const nbstates = this.stateGraph.listAllStates().length;
        const stateId = this.stateGraph.getId(state);
        if (stateId === nbstates) {
           this.addState(state);
        }
        
        this.currentStateId = stateId;
        
        if (!this.exploredStates.has(stateId)) {            
            this.exploreState(stateId);
        }
        this.cy.nodes().forEach(node => {
            node.data('color', node.id() === `state${stateId}` ? 'green' : '#11479e');
        });
    }

    exploreState(stateId) {
    if (this.exploredStates.has(stateId)) return;
    
    this.exploredStates.add(stateId);
    const state = this.stateGraph.getState(stateId); // Retrieve the actual state vector
    const enabledTransitions = this.sharedState.petriNet.getEnabledTransitions(state);
    
    enabledTransitions.forEach(transitionId => {
        const successorState = this.sharedState.petriNet.fireTransition(state, transitionId);
        const nbstates = this.stateGraph.listAllStates().length;
        const successorStateId = this.stateGraph.getId(successorState);
        if (this.stateGraph.getId(successorState) === nbstates) {
            this.addState(successorState);
        }
        this.addTransition(stateId, successorStateId, transitionId);
        if (!this.cy.getElementById(`state${successorStateId}`).length) {
            this.addState(successorState);
        }
    });
    
    const stateLabel = this.stateGraph.getStateLabel(stateId);
    this.updateStateNode(stateId, stateLabel, 'solid');
}


    updateStateNode(stateId, label, borderStyle) {
        const node = this.cy.getElementById(`state${stateId}`);
        if (node) {
            node.data('label', label);
            node.data('borderStyle', borderStyle);
        }
    }
    
    clear() {
    this.stateGraph = new StateGraph(this.sharedState.petriNet);
    this.exploredStates = new Set();
    this.cy.elements().remove();
    }

}

export default StateGraphView;
