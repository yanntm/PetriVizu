import AbstractMode from './abstractMode';
import { createCytoscapeElements, updateCytoscapeCommon, syncGraphicsFromCy } from './cytoscapeUtils';
import Trace from './trace';
import StateGraphView from './stateGraphView';
import { SharedState } from './sharedState';
import { WalkUtils } from './walkUtils';
import { PetriNet, State, NodeType } from './petriNetModel';

export default class SimulationMode extends AbstractMode {
    private stateGraphView: StateGraphView;
    private currentState: State;
    private currentEnabled: string[];
    private trace: Trace;
    private walkUtils: WalkUtils;

    constructor(sharedState: SharedState) {
        super(sharedState, 'simulation-cy');
        this.stateGraphView = new StateGraphView('state-graph-cy', this.sharedState);
        this.currentState = this.sharedState.petriNet.initialState.slice();
        this.currentEnabled = [];
        this.trace = new Trace();
        this.walkUtils = new WalkUtils(this.sharedState.petriNet);
        this.setupEventListeners();
        this.setupStateGraphListener();
    }

    activate(): void {
        this.stateGraphView.clear();
        this.currentState = this.sharedState.petriNet.initialState.slice();
        this.walkUtils = new WalkUtils(this.sharedState.petriNet);
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

    setupEventListeners(): void {
        this.cy.on('tap', 'node.transition', (event) => {
            const transitionId = event.target.id();
            if (this.currentEnabled.includes(transitionId)) {
                this.fireTransition(transitionId);
            }
        });

        document.getElementById('reset')?.addEventListener('click', () => this.resetSimulation());
    }
    
    setupStateGraphListener(): void {
        this.stateGraphView.addStateClickListener((state: State) => {
            this.jumpToState(state);
        });
    }

    jumpToState(state: State): void {
        this.trace.clear();
        this.currentState = state;
        this.updateCytoShownState();
        this.updateEnabled();
        this.updateCurrentStateDisplay();
        this.updateTraceDisplay();
    }

    updateCytoShownState(): void {
        this.cy.nodes().forEach(node => {
            if (node.hasClass('place')) {
                const placeId = node.data('id');
                const placeIndex = this.sharedState.petriNet.nodes.get(placeId)?.index;
                if (placeIndex !== undefined) {
                    const marking = this.currentState[placeIndex];
                    const labelParts = node.data('label').split('\n');
                    const name = labelParts[0];
                    node.data('label', `${name}\n${marking}`);
                }
            }
        });
    }

    updateEnabled(): void {
        this.currentEnabled = this.walkUtils.getEnabledTransitions(this.currentState);
        const enabledTransitionsDiv = document.getElementById('enabled-transitions');
        if (enabledTransitionsDiv) {
            enabledTransitionsDiv.innerHTML = "";

            this.sharedState.petriNet.transNames.forEach((transitionId:string) => {
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
        }

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

    updateCurrentStateDisplay(): void {
        const currentStateTextarea = document.getElementById('current-state') as HTMLTextAreaElement;
        let stateText = "";
        this.sharedState.petriNet.placeNames.forEach((placeId:string) => {
            const placeIndex = this.sharedState.petriNet.nodes.get(placeId)?.index;
            if (placeIndex !== undefined) {
                stateText += `${placeId}: ${this.currentState[placeIndex]}\n`;
            }
        });
        if (currentStateTextarea) {
            currentStateTextarea.value = stateText;
        }
    }

    updateTraceDisplay(): void {
        const traceDiv = document.getElementById('trace');
        if (traceDiv) {
            traceDiv.innerHTML = "";

            this.trace.getTransitions().forEach(transitionId => {
                const transitionItem = document.createElement('div');
                transitionItem.innerText = transitionId;
                traceDiv.appendChild(transitionItem);
            });
        }
    }

    fireTransition(transitionId: string): void {
        const previousState = this.currentState;
        this.currentState = this.walkUtils.fireTransition(this.currentState, transitionId);
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

    resetSimulation(): void {
        this.currentState = this.sharedState.petriNet.initialState.slice();
        this.trace.clear();
        this.stateGraphView.updateCurrentState(this.currentState);
        this.updateCytoShownState();
        this.updateEnabled();
        this.updateCurrentStateDisplay();
        this.updateTraceDisplay();
    }
}

export { SimulationMode };
