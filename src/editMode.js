import { PetriNet } from './petriNetModel';
import { initCytoscape } from './cytoscapeIntegration.js';
import { updateCytoscapeCommon, updateLabelPositions } from './cytoscapeUtils.js';

let cy;
let petriNet;
let currentTool = null;

function enterEditMode(existingNet) {
    petriNet = existingNet || new PetriNet();

    // Initialize Cytoscape with the existing or new Petri net in the editor container
    cy = initCytoscape(petriNet, 'editor-cy');
    updateCytoscape(cy, petriNet, true); // Pass true to indicate edit mode

    // Show the palette for adding elements
    document.getElementById('palette').style.display = 'block';

    // Make text labels editable with the editText tool
    cy.on('tap', 'node, edge', function(event) {
        if (currentTool === 'editText') {
            const target = event.target;
            const newName = prompt("Enter new value:", target.data('name'));
            if (newName !== null) {
                target.data('name', newName);
                updateLabelPositions(cy); // Update label positions after renaming
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


    // Handle arc creation
    let sourceNode = null;
    cy.on('tap', 'node', function(event) {
        if (currentTool === 'arc') {
            if (!sourceNode) {
                sourceNode = event.target;
            } else {
                addArc(sourceNode.id(), event.target.id());
                sourceNode = null;
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
            data: { id: placeId, marking: 0 },
            position: position,
            classes: 'place'
        },
        {
            group: 'nodes',
            data: { id: `${placeId}_name`, parent: `parent_${placeId}`, name: placeId },
            position: { x: position.x, y: position.y - 25 },
            classes: 'node-name'
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
            data: { id: transitionId },
            position: position,
            classes: 'transition'
        },
        {
            group: 'nodes',
            data: { id: `${transitionId}_name`, parent: `parent_${transitionId}`, name: transitionId },
            position: { x: position.x, y: position.y - 25 },
            classes: 'node-name'
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
    updateLabelPositions(cy);
}

export { enterEditMode, selectTool, addPlace, addTransition, addArc };
