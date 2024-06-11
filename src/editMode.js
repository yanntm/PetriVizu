import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import { PetriNet } from './petriNetModel';
import { initCytoscape } from './viewMode.js';
import { updateCytoscapeCommon } from './cytoscapeUtils.js';

cytoscape.use(edgehandles);

let cy;
let petriNet;
let currentTool = null;
let eh; // Edgehandles instance

function enterEditMode(existingNet) {
    petriNet = existingNet || new PetriNet();

    // Initialize Cytoscape with the existing or new Petri net in the editor container
    cy = initCytoscape(petriNet, 'editor-cy');
    updateCytoscape(cy, petriNet, true); // Pass true to indicate edit mode

    // Initialize edge handles with bipartite constraint
    eh = cy.edgehandles({
        toggleOffOnLeave: true,
        handleNodes: "node",
        handleSize: 10,
        edgeType: function() {
            return 'flat';
        },
        complete: function(sourceNode, targetNode, addedEdge) {
            console.log('Edge added:', sourceNode, targetNode, addedEdge);
            const arcId = `${sourceNode.id()}-${targetNode.id()}`;
            petriNet.addArc(sourceNode.id(), targetNode.id(), 1);
            cy.add([
                {
                    group: 'edges',
                    data: { id: arcId, source: sourceNode.id(), target: targetNode.id(), weight: 1 }
                }
            ]);
        },
        canConnect: function(sourceNode, targetNode) {
            // Enforce bipartite constraint
            const sourceIsPlace = sourceNode.hasClass('place');
            const targetIsPlace = targetNode.hasClass('place');
            const sourceIsTransition = sourceNode.hasClass('transition');
            const targetIsTransition = targetNode.hasClass('transition');

            return (sourceIsPlace && targetIsTransition) || (sourceIsTransition && targetIsPlace);
        },
        edgeParams: function(sourceNode, targetNode) {
            // Return element object to be passed to cy.add() for edge
            return {};
        },
        hoverDelay: 150,
        snap: true,
        snapThreshold: 50,
        snapFrequency: 15,
        noEdgeEventsInDraw: true,
        disableBrowserGestures: true
    });

    // Show the palette for adding elements
    document.getElementById('palette').style.display = 'block';

    // Make text labels editable with the editText tool
    cy.on('tap', 'node, edge', function(event) {
        if (currentTool === 'editText') {
            const target = event.target;
            const labelParts = target.data('label').split('\n');
            const name = labelParts[0];
            const marking = labelParts[1] || '';
            const newName = prompt("Enter new name:", name);
            const newMarking = target.hasClass('place') ? prompt("Enter new marking:", marking) : marking;
            if (newName !== null) {
                const newLabel = target.hasClass('place') ? `${newName}\n${newMarking}` : newName;
                target.data('label', newLabel);
            }
        }
    });

    // Handle canvas clicks
    cy.on('tap', function(event) {
        if (event.target === cy) { // Check if the target is the background
            const pos = event.position;
            if (currentTool === 'place') {
                addPlace(pos);
            } else if (currentTool === 'transition') {
                addTransition(pos);
            }
        }
    });
}

function selectTool(tool) {
    currentTool = tool;

    // Highlight the selected tool
    document.querySelectorAll('#palette button').forEach(button => {
        button.style.backgroundColor = button.id === `add${capitalizeFirstLetter(tool)}` ? 'lightgray' : '';
    });

    if (tool === 'arc') {
        eh.enableDrawMode();
    } else {
        eh.disableDrawMode();
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function addPlace(position) {
    const placeId = `p${petriNet.places.length}`;
    petriNet.addPlace(placeId, placeId, 0);

    // Add place to Cytoscape
    cy.add([
        {
            group: 'nodes',
            data: { id: placeId, label: `${placeId}\n0` }, // Combined label with name and marking
            position: position,
            classes: 'place'
        }
    ]);
}

function addTransition(position) {
    const transitionId = `t${petriNet.transitions.length}`;
    petriNet.addTransition(transitionId, transitionId);

    // Add transition to Cytoscape
    cy.add([
        {
            group: 'nodes',
            data: { id: transitionId, label: transitionId }, // Single label with name
            position: position,
            classes: 'transition'
        }
    ]);
}

function addArc(sourceId, targetId) {
    if (!sourceId || !targetId) {
        alert("Source and target IDs are required.");
        return;
    }

    if (!cy.getElementById(sourceId).length || !cy.getElementById(targetId).length) {
        alert("Invalid source or target ID.");
        return;
    }

    const arcId = `${sourceId}-${targetId}`;
    petriNet.addArc(sourceId, targetId, 1);

    // Add arc to Cytoscape
    cy.add([
        {
            group: 'edges',
            data: { id: arcId, source: sourceId, target: targetId, weight: 1 }
        }
    ]);
}

function updateCytoscape(cy, petriNet, editMode = false) {
    updateCytoscapeCommon(cy, petriNet, editMode);
}

export { enterEditMode, selectTool, addPlace, addTransition, addArc };
