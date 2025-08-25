import { StylesheetCSS as Stylesheet } from 'cytoscape';

const cytoscapeStyles: Stylesheet[] = [
  {
    selector: 'node.place',
    css: {
      'shape': 'ellipse',
      'background-color': 'white',
      'border-color': 'black',
      'border-width': '2px',
      'label': 'data(label)', // Combined label for name and marking
      'text-valign': 'center',
      'text-halign': 'center',
      'font-size': '12px',
      'text-wrap': 'wrap',
      'text-max-width': '80px'
    }
  },
  {
    selector: 'node.transition',
    css: {
      'shape': 'rectangle',
      'background-color': 'white', // Non-filled rectangle with white background
      'border-color': 'black',
      'border-width': '2px',
      'label': 'data(label)', // Combined label for name and additional info
      'text-valign': 'center',
      'text-halign': 'center',
      'font-size': '12px',
      'text-wrap': 'wrap',
      'text-max-width': '80px'
    }
  },
  {
    selector: 'edge',
    css: {
      'width': 2,
      'line-color': 'black',
      'target-arrow-color': 'black',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'font-size': '10px',
      'color': 'black'
    }
  },
  {
    selector: 'edge[label]',
    css: {
      'label': 'data(label)', // Apply label style only if label is present
    }
  }
];

export default cytoscapeStyles;
