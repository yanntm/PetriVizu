const cytoscapeStyles = [
    {
        selector: 'node.place',
        style: {
            'shape': 'ellipse',
            'background-color': '#ffffff',
            'border-color': '#000000',
            'border-width': '2px',
            'label': 'data(marking)', // Display marking inside the circle
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px'
        }
    },
    {
        selector: 'node.place-name',
        style: {
            'background-color': 'transparent', // Ensure no background color for the name
            'border-width': '0px', // Ensure no border for the name
            'label': 'data(name)',
            'text-valign': 'bottom', // Position name below the circle
            'text-halign': 'center',
            'color': '#000000',
            'font-size': '10px'
        }
    },
    {
        selector: 'node.transition',
        style: {
            'shape': 'rectangle',
            'background-color': '#000000',
            'label': 'data(name)',
            'color': '#ffffff',
            'text-valign': 'center',
            'text-halign': 'center'
        }
    },
    {
        selector: 'edge',
        style: {
            'width': 2,
            'line-color': '#000000',
            'target-arrow-color': '#000000',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(weight)',
            'font-size': '10px',
            'color': '#000000'
        }
    }
];

export default cytoscapeStyles;
