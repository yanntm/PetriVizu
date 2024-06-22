## Petri Net Visualization

A Petri net visualization and simulation tool in your browser.

Available here : https://yanntm.github.io/PetriVizu

Features currently include loading nets from PNML, visualizing them with some layout helpers, editing nets, export to PNML, interactive simulation and reachability graph exploration, and analysis using state of the art Model-Checking contest compliant tools.

### Building the Project

This project is in JS, and relies on the Cytoscape graph library.

To build the project from the git repository:

```bash
npm install
npm run build
```

### Running the Local Server

To run the local server:

```bash
npm start
```

## Integration with MCC-server

To perform model-checking analyses, deploy and run the [MCC-server](https://github.com/yanntm/MCC-server) Docker container.

PetriVizu tries to connect to a server running on localhost; so you must first start the mcc-server to benefit from the analysis mode.

For more details, visit the [MCC-server repository](https://github.com/yanntm/MCC-server).
