import cytoscape, { Core } from 'cytoscape';
import fcose from 'cytoscape-fcose';
import dagre from 'cytoscape-dagre';
import { Mode } from './app';

cytoscape.use(fcose);
cytoscape.use(dagre);

interface LayoutOption {
    name: string;
    description: string;
}

const layouts: LayoutOption[] = [
    { name: 'fcose', description: 'fCoSE (Fast CoSE)' },
    { name: 'cose', description: 'CoSE (Clustered Spring Embedder)' },
    { name: 'dagre', description: 'Dagre (DAG Layout)' },
    { name: 'circle', description: 'Circle Layout' },
    { name: 'grid', description: 'Grid Layout' },
    { name: 'random', description: 'Random Layout' },
    { name: 'concentric', description: 'Concentric Layout' },
    { name: 'breadthfirst', description: 'Breadthfirst Layout' }
];

class LayoutHandler {
    private currentMode: Mode | null;

    constructor() {
        this.currentMode = null;
        this.initialize();
    }

    private initialize(): void {
        const layoutDropdown = document.getElementById('layout-dropdown');
        layouts.forEach(layout => {
            const option = document.createElement('option');
            option.value = layout.name;
            option.text = layout.description;
            layoutDropdown?.appendChild(option);
        });

        const fitButton = document.getElementById('fit-button');
        const applyLayoutButton = document.getElementById('apply-layout-button');

        fitButton?.addEventListener('click', () => {
            if (this.currentMode?.cy) {
                this.currentMode.cy.fit();
            }
        });

        applyLayoutButton?.addEventListener('click', () => {
            const selectedLayout = (layoutDropdown as HTMLSelectElement)?.value;
            if (this.currentMode?.layout && selectedLayout) {
                this.currentMode.layout(selectedLayout);
            }
        });
    }

    setCurrentMode(mode: Mode): void {
        this.currentMode = mode;
    }
}

export default LayoutHandler;
