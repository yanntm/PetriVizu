import AbstractMode from './abstractMode';
import cytoscape from 'cytoscape';
import { updateCytoscapeCommon } from './cytoscapeUtils';
import { SharedState } from './sharedState';
import edgehandles, { EdgeHandlesOptions } from 'cytoscape-edgehandles';
import { reorderNet } from './netOrderProvider';
cytoscape.use(edgehandles);

export default class EditMode extends AbstractMode {
    private currentTool: string;
    private eh: any;

    constructor(sharedState: SharedState) {
        super(sharedState, 'editor-cy');
        this.currentTool = 'selectMove';
        this.eh = null;
        this.setupEdgehandles();
        this.setupEventListeners();
    }

    activate(): void {
        updateCytoscapeCommon(this.cy, this.sharedState.petriNet, true);
        requestAnimationFrame(() => {
            this.cy.fit();
        });
        this.cy.on('layoutstop', () => {
            this.cy.fit();
        });
    }

    deactivate(): void {
        // Reorder places and transitions
        this.sharedState.petriNet = reorderNet(this.sharedState.petriNet);
        super.deactivate();
    }

    setupEdgehandles(): void {
        this.eh = this.cy.edgehandles({
            canConnect: function (sourceNode, targetNode) {
                const sourceIsPlace = sourceNode.hasClass('place');
                const targetIsPlace = targetNode.hasClass('place');
                const sourceIsTransition = sourceNode.hasClass('transition');
                const targetIsTransition = targetNode.hasClass('transition');
                return (sourceIsPlace && targetIsTransition) || (sourceIsTransition && targetIsPlace);
            },
            edgeParams: function () {
                return { data: { label: '1' } };
            },
            hoverDelay: 150,
            snap: true,
            snapThreshold: 50,
            snapFrequency: 15,
            noEdgeEventsInDraw: true,
            disableBrowserGestures: true
        });

        this.cy.on('ehcomplete', (event, sourceNode, targetNode, addedEdge) => {
            console.log('Edge added:', sourceNode.id(), targetNode.id(), addedEdge.id());
            this.addArc(sourceNode.id(), targetNode.id(), 1);
        });
    }

    setupEventListeners(): void {
        document.getElementById('selectMove')?.addEventListener('click', () => this.selectTool('selectMove'));
        document.getElementById('addPlace')?.addEventListener('click', () => this.selectTool('place'));
        document.getElementById('addTransition')?.addEventListener('click', () => this.selectTool('transition'));
        document.getElementById('addArc')?.addEventListener('click', () => this.selectTool('arc'));
        document.getElementById('editText')?.addEventListener('click', () => this.selectTool('editText'));
        document.getElementById('delete')?.addEventListener('click', () => this.selectTool('delete'));

        this.cy.on('tap', 'node, edge', (event) => this.handleTapEvent(event));
        this.cy.on('tap', (event) => this.handleCanvasClick(event));
    }

    selectTool(tool: string): void {
        this.currentTool = tool;
        console.log('Selected Tool:', tool);

        document.querySelectorAll<HTMLButtonElement>('#palette button').forEach(button => {
            button.style.backgroundColor = button.id === `add${this.capitalizeFirstLetter(tool)}` ? 'lightgray' : '';
            if (button.id === 'selectMove') {
                button.style.backgroundColor = tool === 'selectMove' ? 'lightgray' : '';
            }
        });

        if (tool === 'arc') {
            this.eh.enableDrawMode();
        } else {
            this.eh.disableDrawMode();
        }
    }

    capitalizeFirstLetter(string: string): string {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    handleTapEvent(event: cytoscape.EventObject): void {
        const target = event.target;
        if (this.currentTool === 'editText') {
            console.log('Edit Text Tool - Target:', target.data());
            if (target.isEdge()) {
                const currentLabel = target.data('label') || '1';
                const newLabel = prompt("Enter new weight:", currentLabel);
                if (newLabel !== null) {
                    try {
                        const sourceNode = this.cy.getElementById(target.data('source'));
                        const targetNode = this.cy.getElementById(target.data('target'));
                        const sourceLabel = sourceNode.data('label').split('\n')[0];
                        const targetLabel = targetNode.data('label').split('\n')[0];
                        this.sharedState.petriNet.updateWeight(sourceLabel, targetLabel, parseInt(newLabel));
                        target.data('label', newLabel);
                    } catch (error) {
                        const errorMessage = (error as Error).message;
                        alert(errorMessage);
                        console.log(errorMessage);
                    }
                }
            } else {
                const labelParts = target.data('label').split('\n');
                const name = labelParts[0];
                const marking = labelParts[1] || '';
                const newName = prompt("Enter new name:", name);
                const newMarking = target.hasClass('place') ? prompt("Enter new marking:", marking) : marking;
                if (newName !== null) {
                    try {
                        if (target.hasClass('place')) {
                            let newMarkingInt = parseInt(newMarking);
                            if (isNaN(newMarkingInt)) {
                              throw Error('Marking must be an integer');
                            }
                            if (name !== newName) {
                              this.sharedState.petriNet.renamePlace(name, newName);
                            }
                            this.sharedState.petriNet.updateInitialState(newName, newMarkingInt);
                            target.data('label', `${newName}\n${newMarking}`);
                        } else if (target.hasClass('transition')) {
                            this.sharedState.petriNet.renameTransition(name, newName);
                            target.data('label', newName);
                        }
                    } catch (error) {
                        const errorMessage = (error as Error).message;
                        alert(errorMessage);
                        console.log(errorMessage);
                    }
                }
            }
        } else if (this.currentTool === 'delete') {
            try {
                if (target.isEdge()) {
                    const sourceNode = this.cy.getElementById(target.data('source'));
                    const targetNode = this.cy.getElementById(target.data('target'));
                    const sourceLabel = sourceNode.data('label').split('\n')[0];
                    const targetLabel = targetNode.data('label').split('\n')[0];
                    this.sharedState.petriNet.deleteArc(sourceLabel, targetLabel);
                    target.remove();
                } else {
                    const labelParts = target.data('label').split('\n');
                    const name = labelParts[0];
                    if (target.hasClass('place')) {
                        this.sharedState.petriNet.deletePlace(name);
                    } else if (target.hasClass('transition')) {
                        this.sharedState.petriNet.deleteTransition(name);
                    }
                    target.remove();
                }
            } catch (error) {
                        const errorMessage = (error as Error).message;
                        alert(errorMessage);
                        console.log(errorMessage);
            }
        }
    }

    handleCanvasClick(event: cytoscape.EventObject): void {
        if (event.target === this.cy) {
            const pos = event.position;
            console.log('Canvas click - Position:', pos);
            if (this.currentTool === 'place') {
                this.addPlace(pos);
            } else if (this.currentTool === 'transition') {
                this.addTransition(pos);
            }
        }
    }

    addPlace(position: { x: number, y: number }): void {
        const placeId = `p${this.sharedState.petriNet.placeNames.length}`;
        try {
            this.sharedState.petriNet.addPlace(placeId, 0);

            this.cy.add([{
                group: 'nodes',
                data: { id: placeId, label: `${placeId}\n0` },
                position: position,
                classes: 'place'
            }]);
            console.log('Added Place - ID:', placeId, 'Position:', position);
        } catch (error) {
                        const errorMessage = (error as Error).message;
                        alert(errorMessage);
                        console.log(errorMessage);
        }
    }

    addTransition(position: { x: number, y: number }): void {
        const transitionId = `t${this.sharedState.petriNet.transNames.length}`;
        try {
            this.sharedState.petriNet.addTransition(transitionId);

            this.cy.add([{
                group: 'nodes',
                data: { id: transitionId, label: transitionId },
                position: position,
                classes: 'transition'
            }]);
            console.log('Added Transition - ID:', transitionId, 'Position:', position);
        } catch (error) {
                        const errorMessage = (error as Error).message;
                        alert(errorMessage);
                        console.log(errorMessage);
        }
    }

    addArc(sourceId: string, targetId: string, weight: number): void {
        try {
            this.sharedState.petriNet.addArc(sourceId, targetId, weight);
            console.log('Added Arc - Source ID:', sourceId, 'Target ID:', targetId);
        } catch (error) {
                        const errorMessage = (error as Error).message;
                        alert(errorMessage);
                        console.log(errorMessage);
        }
    }
}

export { EditMode };
