## Petri Net Visualization

A Petri net visualization and simulation tool in your browser.

Available here : https://yanntm.github.io/PetriVizu

Features currently include loading nets from PNML, visualizing them with some layout helpers, editing nets. 

Export and simulation mode forthcoming.

### Building the Project

This project is in JS, and relies on cytoscape graph library.

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

By default, the server will run on port 1664. You can specify a different port by providing it as an argument:

```bash
node runServer.py 8080
```
