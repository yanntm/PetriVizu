const cytoscapeStyles = [
    {
        selector: 'node.parent-node',
        style: {
            'background-opacity': 0,
            'border-opacity': 0,
            'text-opacity': 0,
            'shape': 'rectangle'
        }
    },
    {
        selector: 'node.place',
        style: {
            'shape': 'ellipse',
            'background-color': 'white',
            'border-color': 'black',
            'border-width': '2px',
            'label': 'data(marking)', // Display marking inside the circle
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px'
        }
    },
    {
        selector: 'node.transition',
        style: {
            'shape': 'rectangle',
            'background-color': 'white', // Non-filled rectangle with white background
            'border-color': 'black',
            'border-width': '2px',
            'label': '' // Label is empty since it will be in the name node
        }
    },
    {
        selector: '.node-name',
        style: {
            'shape': 'none', // No shape, just a text label
            'background-opacity': 0, // Ensure no background color for the name
            'border-width': 0, // Ensure no border for the name
            'label': 'data(name)',
            'text-valign': 'bottom', // Position name below the shape
            'text-halign': 'center',
            'color': 'black',
            'font-size': '10px'
        }
    },
    {
        selector: 'edge',
        style: {
            'width': 2,
            'line-color': 'black',
            'target-arrow-color': 'black',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(weight)',
            'font-size': '10px',
            'color': 'black'
        }
    }
];

export default cytoscapeStyles;
