import { PetriNet, State, NodeType } from './petriNetModel';
import cytoscape, { Core } from 'cytoscape';
import cytoscapeStyles from './cytoscapeStyles';

interface CytoscapeOptions {
    showAllLabels?: boolean;
}

function createCytoscapeElements(petriNet: PetriNet, options: CytoscapeOptions = {}): cytoscape.ElementDefinition[] {
    const elements: cytoscape.ElementDefinition[] = [];
    const { showAllLabels = false } = options;

    petriNet.nodes.forEach((node, id) => {
        let label: string;
        if (node.type === NodeType.Place) {
            label = showAllLabels || petriNet.initialState[node.index] > 0 ? `${id}\n${petriNet.initialState[node.index]}` : id;
        } else {
            label = id;
        }
        const position = petriNet.getPosition(id);

        elements.push({
            data: {
                id: id,
                label: label
            },
            position: position,
            classes: node.type === NodeType.Place ? ['place' ] : ['transition']
        });
    });

    for (const [sourceId, targetId, weight] of petriNet.getArcs()) {
        elements.push({
            data: {
                id: `${sourceId}-${targetId}`,
                source: sourceId,
                target: targetId,
                label: showAllLabels || weight > 1 ? `${weight}` : '' // Only show weight if showAllLabels is true or greater than 1
            }
        });
    }

    return elements;
}

function updateCytoscapeCommon(cy: Core, petriNet: PetriNet, showAllLabels: boolean = false): void {
    const elements = createCytoscapeElements(petriNet, { showAllLabels });
    cy.elements().remove();
    cy.add(elements);
}

function syncGraphicsFromCy(cy: Core, petriNet: PetriNet): void {
    cy.nodes().forEach(node => {
        const position = node.position();
        const labelParts = node.data('label').split('\n');
        const id = labelParts[0];  // Extract the id/name from the label
        petriNet.setPosition(id, position);
    });
}


function initCytoscape(containerId: string): Core {
    const cy = cytoscape({
        container: document.getElementById(containerId),
        style: cytoscapeStyles,
        layout: { name: 'cose', fit: true, padding: 10 }
    });

    return cy;
}

export { createCytoscapeElements, updateCytoscapeCommon, syncGraphicsFromCy, initCytoscape };
