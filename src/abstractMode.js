// abstractMode.js
import cytoscape from 'cytoscape';
import cytoscapeStyles from './cytoscapeStyles';
import { syncGraphicsFromCy } from './cytoscapeUtils.js';


export default class AbstractMode {
    constructor(sharedState, containerId) {
        if (new.target === AbstractMode) {
            throw new TypeError("Cannot construct AbstractMode instances directly");
        }
        this.sharedState = sharedState;
        this.cy = this.initCytoscape(containerId);
    }

    initCytoscape(containerId) {
        return cytoscape({
            container: document.getElementById(containerId),
            style: cytoscapeStyles,
            layout: { name: 'fcose', padding: 10 }
        });
    }

// abstractMode.js
layout(layoutName) {
    const layout = this.cy.layout({ name: layoutName, padding: 10 });
    layout.run();
    layout.promiseOn('layoutstop').then(() => {
            this.cy.fit();
    });
}


    activate() {
        throw new Error('Method not implemented.');
    }

    deactivate() {
        syncGraphicsFromCy(this.cy, this.sharedState.petriNet);
    }

    setSharedState(sharedState) {
        this.sharedState = sharedState;
    }
}
