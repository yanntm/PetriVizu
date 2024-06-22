import { exportToPNMLContent } from './exporter.js';

export default class PropertyMode {
    constructor(sharedState) {
        this.sharedState = sharedState;

        this.addProperty = this.addProperty.bind(this);
        this.removeProperty = this.removeProperty.bind(this);
        this.runPropertyAnalysis = this.runPropertyAnalysis.bind(this);
        this.setupPropertyControls = this.setupPropertyControls.bind(this);

        this.properties = [];
        this.setupPropertyControls();
    }

    setupPropertyControls() {
        document.getElementById('add-property').addEventListener('click', this.addProperty);
        document.getElementById('remove-property').addEventListener('click', this.removeProperty);
    }

    activate() {
        // Logic to activate the property tab, e.g., setting up controls
    }

    deactivate() {
        // Logic to deactivate the property tab, e.g., cleaning up controls
    }

    addProperty() {
        // Placeholder for adding a property
        const property = {
            name: `Property ${this.properties.length + 1}`,
            examination: 'ReachabilityDeadlock',
            tool: 'itstools',
            timeout: 100
        };
        this.properties.push(property);
        this.renderPropertyList();
    }

    removeProperty() {
        // Placeholder for removing the last property
        this.properties.pop();
        this.renderPropertyList();
    }

    renderPropertyList() {
        const propertyList = document.getElementById('property-list');
        propertyList.innerHTML = '';

        this.properties.forEach((property, index) => {
            const propertyDiv = document.createElement('div');
            propertyDiv.className = 'property-item';
            propertyDiv.textContent = `${property.name} - ${property.examination} - ${property.tool} - ${property.timeout}s`;
            propertyDiv.addEventListener('click', () => this.runPropertyAnalysis(property));
            propertyList.appendChild(propertyDiv);
        });
    }

    async runPropertyAnalysis(property) {
        const pnmlContent = exportToPNMLContent(this.sharedState.petriNet);

        const formData = new FormData();
        const blob = new Blob([pnmlContent], { type: 'application/xml' });
        formData.append('model.pnml', blob, 'model.pnml');

        const stdoutElem = document.getElementById('property-stdout');
        const stderrElem = document.getElementById('property-stderr');
        stdoutElem.value = '';
        stderrElem.value = '';

        try {
            const response = await fetch(`http://localhost:5000/mcc/PT/${property.examination}/${property.tool}`, {
                method: 'POST',
                body: formData
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let done = false;

            while (!done) {
                const { value, done: streamDone } = await reader.read();
                done = streamDone;
                const text = decoder.decode(value, { stream: !done });

                const parts = text.split('\n');
                parts.forEach(part => {
                    if (part.startsWith('data:')) {
                        const output = part.slice(5); // Remove 'data:' prefix
                        stdoutElem.value += output + '\n';
                    }
                });
            }
        } catch (error) {
            console.error('Error running property analysis:', error);
            stderrElem.value = 'Error running analysis. Please check server logs for details.';
        }
    }
}
