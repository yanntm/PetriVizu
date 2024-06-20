// stateGraphView.js

import cytoscape from 'cytoscape';
import StateGraph from './stateGraph';

class StateGraphView {
    constructor(containerId, petriNet) {
        this.stateGraph = new StateGraph();
        this.petriNet = petriNet;
        this.cy = this.initCytoscape(containerId);
        this.exploredStates = new Set(); // Set to track explored states
        this.currentStateId = null; // Track the current state ID
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

    addState(state) {
        const stateId = this.stateGraph.getId(state);
        const label = this.stateGraph.getStateLabel(stateId);
        this.cy.add({
            group: 'nodes',
            data: { 
                id: `state${stateId}`, 
                label, 
                color: stateId === this.currentStateId ? 'green' : '#11479e',
                borderStyle: this.exploredStates.has(stateId) ? 'solid' : 'dashed'
            }
        });
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
        const stateLabel = this.stateGraph.getStateLabel(stateId);
        const state = JSON.parse(stateLabel); // Convert label back to state object
        const enabledTransitions = this.petriNet.getEnabledTransitions(state);
        
        enabledTransitions.forEach(transitionId => {
            const successorState = this.petriNet.fireTransition(state, transitionId);
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
        
        this.updateStateNode(stateId, stateLabel, 'solid');
    }

    updateStateNode(stateId, label, borderStyle) {
        const node = this.cy.getElementById(`state${stateId}`);
        if (node) {
            node.data('label', label);
            node.data('borderStyle', borderStyle);
        }
    }
}

export default StateGraphView;
