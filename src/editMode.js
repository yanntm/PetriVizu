import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import { PetriNet } from './petriNetModel';
import { initCytoscape } from './viewMode.js';
import { updateCytoscapeCommon } from './cytoscapeUtils.js';

cytoscape.use(edgehandles);

let cy;
let petriNet;
let currentTool = 'selectMove';
let eh; // Edgehandles instance

function enterEditMode(existingNet) {
    petriNet = existingNet || new PetriNet();

    // Initialize Cytoscape with the existing or new Petri net in the editor container
    cy = initCytoscape(petriNet, 'editor-cy');
    updateCytoscape(cy, petriNet, true); // Pass true to indicate edit mode

    // Run layout once after entering edit mode
    cy.layout({ name: 'cose', padding: 10 }).run();

    // Initialize edge handles with bipartite constraint
    eh = cy.edgehandles({
        toggleOffOnLeave: true,
        handleNodes: "node",
        handleSize: 10,
        edgeType: function() {
            return 'flat';
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
            return {                
                data: {                    
                    label: '1' // Set the default weight
                }
            };
        },
        hoverDelay: 150,
        snap: true,
        snapThreshold: 50,
        snapFrequency: 15,
        noEdgeEventsInDraw: true,
        disableBrowserGestures: true
    });
    
    cy.on('ehcomplete', (event, sourceNode, targetNode, addedEdge) => {
		console.log('Edge added:', sourceNode.id(), targetNode.id(), addedEdge.id());        
        addArc(sourceNode.id(), targetNode.id(), 1);
	});
    
    

    // Show the palette for adding elements
    document.getElementById('palette').style.display = 'block';

    // Add event listeners for the palette buttons
    document.getElementById('selectMove').addEventListener('click', () => selectTool('selectMove'));
    document.getElementById('addPlace').addEventListener('click', () => selectTool('place'));
    document.getElementById('addTransition').addEventListener('click', () => selectTool('transition'));
    document.getElementById('addArc').addEventListener('click', () => selectTool('arc'));
    document.getElementById('editText').addEventListener('click', () => selectTool('editText'));

    // Set the default tool to 'selectMove' and highlight it
    selectTool('selectMove');

    // Make text labels editable with the editText tool
	// Make text labels editable with the editText tool
    cy.on('tap', 'node, edge', function(event) {
        if (currentTool === 'editText') {
            const target = event.target;
            console.log('Edit Text Tool - Target:', target.data());

            if (target.isEdge()) {
                const currentLabel = target.data('label') || '1'; // Default to '1' if label is not set
                const newLabel = prompt("Enter new weight:", currentLabel);
                if (newLabel !== null) {
                    const sourceNode = cy.getElementById(target.data('source'));
                    const targetNode = cy.getElementById(target.data('target'));
                    const sourceLabel = sourceNode.data('label').split('\n')[0];
                    const targetLabel = targetNode.data('label').split('\n')[0];
                    petriNet.updateWeight(sourceLabel, targetLabel, parseInt(newLabel));
                    target.data('label', newLabel); // Update Cytoscape edge label
                }            
           } else {
                const labelParts = target.data('label').split('\n');
                const name = labelParts[0];
                const marking = labelParts[1] || '';
                const newName = prompt("Enter new name:", name);
                const newMarking = target.hasClass('place') ? prompt("Enter new marking:", marking) : marking;
                if (newName !== null) {
                    if (target.hasClass('place')) {
                        petriNet.renamePlace(name, newName);
                        target.data('label', `${newName}\n${newMarking}`);
                    } else if (target.hasClass('transition')) {
                        petriNet.renameTransition(name, newName);
                        target.data('label', newName);
                    }
                }
            }
        }
    });


    // Handle canvas clicks
    cy.on('tap', function(event) {
        if (event.target === cy) { // Check if the target is the background
            const pos = event.position;
            console.log('Canvas click - Position:', pos);
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
    console.log('Selected Tool:', tool);

    // Highlight the selected tool
    document.querySelectorAll('#palette button').forEach(button => {
        button.style.backgroundColor = button.id === `add${capitalizeFirstLetter(tool)}` ? 'lightgray' : '';
        if (button.id === `selectMove`) {
            button.style.backgroundColor = tool === 'selectMove' ? 'lightgray' : '';
        }
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
    const placeId = `p${petriNet.places.size}`;
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
    console.log('Added Place - ID:', placeId, 'Position:', position);
}

function addTransition(position) {
    const transitionId = `t${petriNet.transitions.size}`;
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
    console.log('Added Transition - ID:', transitionId, 'Position:', position);
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

    petriNet.addArc(sourceId, targetId, 1);

    console.log('Added Arc - Source ID:', sourceId, 'Target ID:', targetId);
}




function updateCytoscape(cy, petriNet, editMode = false) {
    updateCytoscapeCommon(cy, petriNet, editMode);
}

export { enterEditMode, selectTool, addPlace, addTransition, addArc };
