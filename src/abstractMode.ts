import cytoscape, { Core, LayoutOptions } from 'cytoscape';
import cytoscapeStyles from './cytoscapeStyles';
import { syncGraphicsFromCy } from './cytoscapeUtils';
import { SharedState } from './sharedState';
import edgehandles from 'cytoscape-edgehandles';
cytoscape.use(edgehandles);

export default abstract class AbstractMode {
    protected sharedState: SharedState;
    public cy: Core;

    constructor(sharedState: SharedState, containerId: string) {
        if (new.target === AbstractMode) {
            throw new TypeError("Cannot construct AbstractMode instances directly");
        }
        this.sharedState = sharedState;
        this.cy = this.initCytoscape(containerId);
    }

    private initCytoscape(containerId: string): Core {
        return cytoscape({
            container: document.getElementById(containerId),
            style: cytoscapeStyles,
            layout: { name: 'fcose' }
        });
    }

    public layout(layoutName: string): void {
        const layoutOptions: LayoutOptions = {
            name: layoutName
        };

        const layout = this.cy.layout(layoutOptions);
        layout.run();
        layout.promiseOn('layoutstop').then(() => {
            this.cy.fit();
        });
    }

    activate(): void {
        throw new Error('Method not implemented.');
    }

    deactivate(): void {
        syncGraphicsFromCy(this.cy, this.sharedState.petriNet);
    }

    setSharedState(sharedState: SharedState): void {
        this.sharedState = sharedState;
    }
}
