import StateGraph from './stateGraph';
import cytoscape, { Core } from 'cytoscape';
import fcose from 'cytoscape-fcose';
import dagre from 'cytoscape-dagre';
import { SharedState } from './sharedState';
import { WalkUtils } from './walkUtils';

cytoscape.use(fcose);
cytoscape.use(dagre);

class StateGraphView {
    private cy: Core;
    public stateGraph: StateGraph;
    private sharedState: SharedState;
    private exploredStates: Set<number>;
    private currentStateId: number | null;
    private listeners: Array<(state: number[]) => void>;
    private walkUtils: WalkUtils;

    constructor(containerId: string, sharedState: SharedState) {
        this.stateGraph = new StateGraph(sharedState.petriNet);
        this.sharedState = sharedState;
        this.cy = this.initCytoscape(containerId);
        this.exploredStates = new Set(); // Set to track explored states
        this.currentStateId = null; // Track the current state ID
        this.listeners = []; // List of listeners for state clicks
        this.walkUtils = new WalkUtils(sharedState.petriNet); // Instantiate WalkUtils

        // Initialize the layout control
        this.initializeLayoutControl();
        // Initialize the click event listener
        this.setupClickListener();
    }

    private initCytoscape(containerId: string): Core {
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
                        'border-width': '2px',
                        'width': 'label',
                        'height': 'label',
                        'shape': 'roundrectangle',
                    }
                },
                {
                    selector: 'node[borderStyle = "solid"]',
                    style: {
                        'border-style': 'solid'
                    }
                },
                {
                    selector: 'node[borderStyle = "dashed"]',
                    style: {
                        'border-style': 'dashed'
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
                name: 'cose'
            }
        });
    }

    private initializeLayoutControl(): void {
        const layoutDropdown = document.getElementById('layout-dropdown') as HTMLSelectElement;
        layoutDropdown.addEventListener('change', () => {
            this.applyLayout(layoutDropdown.value);
        });
    }

    public applyLayout(layoutName: string): void {
        this.cy.layout({ name: layoutName }).run();
        requestAnimationFrame(() => {
            this.cy.fit();
        });
        this.cy.on('layoutstop', () => {
            this.cy.fit();
        });
    }

    private setupClickListener(): void {
        this.cy.on('tap', 'node', (event) => {
            const stateId = parseInt(event.target.id().replace('state', ''), 10);
            const state = this.stateGraph.getState(stateId);
            if (state) {
                this.updateCurrentState(state);
                this.notifyListeners(state);
            }
        });
    }

    private notifyListeners(state: number[]): void {
        this.listeners.forEach(listener => listener(state));
    }

    addStateClickListener(listener: (state: number[]) => void): void {
        this.listeners.push(listener);
    }

    addState(state: number[]): void {
        const stateId = this.stateGraph.getId(state);
        const label = this.stateGraph.getStateLabel(stateId);
        console.log(`[StateGraphView] Adding state node to Cytoscape. ID: ${stateId}, Label: "${label}"`);
        this.cy.add({
            group: 'nodes',
            data: { 
                id: `state${stateId}`, 
                label, 
                color: stateId === this.currentStateId ? '#90ee90' : '#d3d3d3', // Light green for current state, light gray for others
                borderStyle: this.exploredStates.has(stateId) ? 'solid' : 'dashed',
                borderColor: stateId === this.stateGraph.getInitialStateId() ? 'blue' : 'black' // Blue border for initial state
            },
            style: {
                'border-color': stateId === this.stateGraph.getInitialStateId() ? 'blue' : 'black'
            }
        });
        this.applyLayout((document.getElementById('layout-dropdown') as HTMLSelectElement).value); // Apply layout after adding state
    }

    addTransition(sourceId: number, destinationId: number, transitionId: string): void {
        console.log(`[StateGraphView] Adding edge to Cytoscape: ${sourceId} -> ${destinationId} (transition: ${transitionId})`);
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
        this.applyLayout((document.getElementById('layout-dropdown') as HTMLSelectElement).value); // Apply layout after adding transition
    }

    updateCurrentState(state: number[]): void {
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
            node.data('color', node.id() === `state${stateId}` ? '#90ee90' : '#d3d3d3'); // Light green for current state, light gray for others
        });
    }
    
    exploreState(stateId: number): void {
        if (this.exploredStates.has(stateId)) return;
    
        console.log(`[StateGraphView] Exploring state ${stateId}`);
        this.exploredStates.add(stateId);
        const state = this.stateGraph.getState(stateId); // Retrieve the actual state vector
        if (state) {
            const enabledTransitions = this.walkUtils.getEnabledTransitions(state);
            console.log(`[StateGraphView] State ${stateId} has enabled transitions: ${enabledTransitions.join(', ')}`);
    
            enabledTransitions.forEach(transitionId => {
                const successorState = this.walkUtils.fireTransition(state, transitionId);
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
    
            const stateLabel = this.stateGraph.getStateLabel(stateId) || '';
            this.updateStateNode(stateId, stateLabel, 'solid');
        }
    }


    updateStateNode(stateId: number, label: string, borderStyle: string): void {
        console.log(`[StateGraphView] Updating state node ${stateId}: label="${label}", borderStyle="${borderStyle}"`);
        const node = this.cy.getElementById(`state${stateId}`);
        if (node) {
            node.data('label', label);
            node.data('borderStyle', borderStyle);
        }
    }

    clear(): void {
        this.stateGraph = new StateGraph(this.sharedState.petriNet);
        this.exploredStates = new Set();
        this.cy.elements().remove();
        this.walkUtils = new WalkUtils(this.sharedState.petriNet); // Re-initialize WalkUtils
    }
}

export default StateGraphView;
