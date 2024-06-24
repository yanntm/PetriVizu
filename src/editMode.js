// editMode.js
import AbstractMode from './abstractMode.js';
import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import { PetriNet } from './petriNetModel';
import { initCytoscape, updateCytoscapeCommon,syncGraphicsFromCy } from './cytoscapeUtils.js';

cytoscape.use(edgehandles);

export default class EditMode extends AbstractMode {
    constructor(sharedState) {
        super(sharedState, 'editor-cy');
        this.currentTool = 'selectMove';
        this.eh = null;
        this.setupEdgehandles();
        this.setupEventListeners();
    }

    activate() {
        updateCytoscapeCommon(this.cy, this.sharedState.petriNet, true);
        requestAnimationFrame(() => {
          this.cy.fit();
         });
         this.cy.on('layoutstop', function(){
        this.cy.fit();
      });        
    }
    
    deactivate() {
      this.sharedState.petriNet.reorder(); // Reorder places and transitions
      super.deactivate();
    }

    setupEdgehandles() {
        this.eh = this.cy.edgehandles({
            toggleOffOnLeave: true,
            handleNodes: "node",
            handleSize: 10,
            edgeType: function () {
                return 'flat';
            },
            canConnect: function (sourceNode, targetNode) {
                const sourceIsPlace = sourceNode.hasClass('place');
                const targetIsPlace = targetNode.hasClass('place');
                const sourceIsTransition = sourceNode.hasClass('transition');
                const targetIsTransition = targetNode.hasClass('transition');
                return (sourceIsPlace && targetIsTransition) || (sourceIsTransition && targetIsPlace);
            },
            edgeParams: function (sourceNode, targetNode) {
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

    setupEventListeners() {
        document.getElementById('selectMove').addEventListener('click', () => this.selectTool('selectMove'));
        document.getElementById('addPlace').addEventListener('click', () => this.selectTool('place'));
        document.getElementById('addTransition').addEventListener('click', () => this.selectTool('transition'));
        document.getElementById('addArc').addEventListener('click', () => this.selectTool('arc'));
        document.getElementById('editText').addEventListener('click', () => this.selectTool('editText'));
        document.getElementById('delete').addEventListener('click', () => this.selectTool('delete'));

        this.cy.on('tap', 'node, edge', (event) => this.handleTapEvent(event));
        this.cy.on('tap', (event) => this.handleCanvasClick(event));
    }
    
  setupEventListeners() {
    document.getElementById('selectMove').addEventListener('click', () => this.selectTool('selectMove'));
    document.getElementById('addPlace').addEventListener('click', () => this.selectTool('place'));
    document.getElementById('addTransition').addEventListener('click', () => this.selectTool('transition'));
    document.getElementById('addArc').addEventListener('click', () => this.selectTool('arc'));
    document.getElementById('editText').addEventListener('click', () => this.selectTool('editText'));
    document.getElementById('delete').addEventListener('click', () => this.selectTool('delete'));

    this.cy.on('tap', 'node, edge', (event) => this.handleTapEvent(event));
    this.cy.on('tap', (event) => this.handleCanvasClick(event));
  }

  selectTool(tool) {
    this.currentTool = tool;
    console.log('Selected Tool:', tool);

    document.querySelectorAll('#palette button').forEach(button => {
      button.style.backgroundColor = button.id === `add${this.capitalizeFirstLetter(tool)}` ? 'lightgray' : '';
      if (button.id === `selectMove`) {
        button.style.backgroundColor = tool === 'selectMove' ? 'lightgray' : '';
      }
    });

    if (tool === 'arc') {
      this.eh.enableDrawMode();
    } else {
      this.eh.disableDrawMode();
    }
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

// editMode.js

handleTapEvent(event) {
    const target = event.target;
    if (this.currentTool === 'editText') {
        console.log('Edit Text Tool - Target:', target.data());
        if (target.isEdge()) {
            const currentLabel = target.data('label') || '1';
            const newLabel = prompt("Enter new weight:", currentLabel);
            if (newLabel !== null) {
                const sourceNode = this.cy.getElementById(target.data('source'));
                const targetNode = this.cy.getElementById(target.data('target'));
                const sourceLabel = sourceNode.data('label').split('\n')[0];
                const targetLabel = targetNode.data('label').split('\n')[0];
                this.sharedState.petriNet.updateWeight(sourceLabel, targetLabel, parseInt(newLabel));
                target.data('label', newLabel);
            }
        } else {
            const labelParts = target.data('label').split('\n');
            const name = labelParts[0];
            const marking = labelParts[1] || '';
            const newName = prompt("Enter new name:", name);
            const newMarking = target.hasClass('place') ? prompt("Enter new marking:", marking) : marking;
            if (newName !== null) {
                let success = false;
                if (target.hasClass('place')) {
                    success = this.sharedState.petriNet.renamePlace(name, newName);
                    if (success) {
                        this.sharedState.petriNet.updateInitialState(newName, parseInt(newMarking));
                        target.data('label', `${newName}\n${newMarking}`);
                    }
                } else if (target.hasClass('transition')) {
                    success = this.sharedState.petriNet.renameTransition(name, newName);
                    if (success) {
                        target.data('label', newName);
                    }
                }
                if (!success) {
                    alert("Name already used.");
                }
            }
        }
    } else if (this.currentTool === 'delete') {
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
    }
}


  handleCanvasClick(event) {
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

  addPlace(position) {
    const placeId = `p${this.sharedState.petriNet.places.size}`;
    this.sharedState.petriNet.addPlace(placeId, placeId, 0);

    this.cy.add([{
      group: 'nodes',
      data: { id: placeId, label: `${placeId}\n0` },
      position: position,
      classes: 'place'
    }]);
    console.log('Added Place - ID:', placeId, 'Position:', position);
  }

  addTransition(position) {
    const transitionId = `t${this.sharedState.petriNet.transitions.size}`;
    this.sharedState.petriNet.addTransition(transitionId, transitionId);

    this.cy.add([{
      group: 'nodes',
      data: { id: transitionId, label: transitionId },
      position: position,
      classes: 'transition'
    }]);
    console.log('Added Transition - ID:', transitionId, 'Position:', position);
  }

  addArc(sourceId, targetId) {
    if (!sourceId || !targetId) {
      alert("Source and target IDs are required.");
      return;
    }

    if (!this.cy.getElementById(sourceId).length || !this.cy.getElementById(targetId).length) {
      alert("Invalid source or target ID.");
      return;
    }

    this.sharedState.petriNet.addArc(sourceId, targetId, 1);
    console.log('Added Arc - Source ID:', sourceId, 'Target ID:', targetId);
  }
}
