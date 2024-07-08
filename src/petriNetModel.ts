type State = number[];

enum NodeType {
    Place = 'place',
    Transition = 'transition'
}

interface Node {
    id: string;
    index: number;
    type: NodeType;
    graphics: Position;
}

interface Arc {
    placeIndex: number;
    weight: number;
}

interface Position {
    x: number;
    y: number;
}

class PetriNet {
    nodes: Map<string, Node>;
    placeNames: string[];
    transNames: string[];
    initialState: State;
    pre: Arc[][];
    post: Arc[][];

    constructor() {
        this.nodes = new Map();
        this.placeNames = [];
        this.transNames = [];
        this.initialState = [];
        this.pre = [];
        this.post = [];
    }

    addPlace(id: string, tokens: number): void {
        const index = this.placeNames.length;
        const node: Node = { id, index, type: NodeType.Place, graphics: { x: 0, y: 0 } };
        this.nodes.set(id, node);
        this.placeNames.push(id);
        this.initialState[index] = tokens;
    }

    addTransition(id: string): void {
        const index = this.transNames.length;
        const node: Node = { id, index, type: NodeType.Transition, graphics: { x: 0, y: 0 } };
        this.nodes.set(id, node);
        this.transNames.push(id);
        this.pre[index] = [];
        this.post[index] = [];
    }

    addArc(sourceId: string, targetId: string, weight: number): void {
        const source = this.nodes.get(sourceId);
        const target = this.nodes.get(targetId);

        if (!source || !target) {
            throw Error("Invalid arc: source and target must be valid nodes.");
        }

        if (source.type === target.type) {
            throw Error("Invalid arc: source and target must be of different types (place and transition).");
        }

        if (source.type === NodeType.Transition) {
            this.post[source.index].push({ placeIndex: target.index, weight });
        } else {
            this.pre[target.index].push({ placeIndex: source.index, weight });
        }
    }

    renamePlace(oldId: string, newId: string): void {
        this.renameNode(oldId, newId);
    }

    renameTransition(oldId: string, newId: string): void {
        this.renameNode(oldId, newId);
    }

    private renameNode(oldId: string, newId: string): void {
        if (this.nodes.has(newId)) {
            throw Error(`Node with ID ${newId} already exists.`);
        }
        const node = this.nodes.get(oldId);
        if (!node) {
            throw Error(`Node ${oldId} does not exist.`);
        }
        node.id = newId;
        this.nodes.delete(oldId);
        this.nodes.set(newId, node);
        if (node.type === NodeType.Place) {
            this.placeNames[node.index] = newId;
        } else {
            this.transNames[node.index] = newId;
        }
    }

    deletePlace(id: string): void {
        const node = this.nodes.get(id);
        if (!node || node.type !== NodeType.Place) {
            throw Error(`Place ${id} does not exist.`);
        }
        const index = node.index;

        // Remove the node
        this.nodes.delete(id);
        this.placeNames.splice(index, 1);
        this.initialState.splice(index, 1);

        // Remove arcs
        this.pre = this.pre.map(arcs => arcs.filter(arc => arc.placeIndex !== index));
        this.post = this.post.map(arcs => arcs.filter(arc => arc.placeIndex !== index));

        // Update indices in pre and post
        this.pre.forEach(arcs => arcs.forEach(arc => {
            if (arc.placeIndex > index) {
                arc.placeIndex--;
            }
        }));
        this.post.forEach(arcs => arcs.forEach(arc => {
            if (arc.placeIndex > index) {
                arc.placeIndex--;
            }
        }));

        // Update node indices
        this.nodes.forEach(n => {
            if (n.type === NodeType.Place && n.index > index) {
                n.index--;
            }
        });
    }

    deleteTransition(id: string): void {
        const node = this.nodes.get(id);
        if (!node || node.type !== NodeType.Transition) {
            throw Error(`Transition ${id} does not exist.`);
        }
        const index = node.index;

        // Remove the node
        this.nodes.delete(id);
        this.transNames.splice(index, 1);
        this.pre.splice(index, 1);
        this.post.splice(index, 1);

        // Update node indices
        this.nodes.forEach(n => {
            if (n.type === NodeType.Transition && n.index > index) {
                n.index--;
            }
        });
    }

    updateWeight(sourceId: string, targetId: string, newWeight: number): void {
        const source = this.nodes.get(sourceId);
        const target = this.nodes.get(targetId);

        if (!source || !target) {
            throw Error("Invalid arc: source and target must be valid nodes.");
        }

        if (source.type === NodeType.Transition) {
            const arc = this.post[source.index].find(arc => arc.placeIndex === target.index);
            if (arc) arc.weight = newWeight;
        } else {
            const arc = this.pre[target.index].find(arc => arc.placeIndex === source.index);
            if (arc) arc.weight = newWeight;
        }
    }

    updateInitialState(placeId: string, newTokens: number): void {
        const placeIndex = this.nodes.get(placeId)?.index;
        if (placeIndex !== undefined) {
            this.initialState[placeIndex] = newTokens;
        } else {
            throw Error(`Place with ID ${placeId} does not exist.`);
        }
    }

    deleteArc(sourceId: string, targetId: string): void {
        const source = this.nodes.get(sourceId);
        const target = this.nodes.get(targetId);

        if (!source || !target) {
            throw Error("Invalid arc: source and target must be valid nodes.");
        }

        if (source.type === NodeType.Transition) {
            this.post[source.index] = this.post[source.index].filter(arc => arc.placeIndex !== target.index);
        } else {
            this.pre[target.index] = this.pre[target.index].filter(arc => arc.placeIndex !== source.index);
        }
    }
    
    
     *getArcs(): IterableIterator<[string, string, number]> {
        for (const [id, node] of this.nodes) {
            if (node.type === NodeType.Transition) {
                for (const arc of this.pre[node.index]) {
                    const placeId = this.placeNames[arc.placeIndex];
                    yield [placeId, id, arc.weight];
                }
                for (const arc of this.post[node.index]) {
                    const placeId = this.placeNames[arc.placeIndex];
                    yield [id, placeId, arc.weight];
                }
            }
        }
    }
    
    getNode(id: string): Node {
        const node = this.nodes.get(id);
        if (!node) {
            throw new Error(`Node with ID ${id} does not exist.`);
        }
        return node;
    }

    
    getPosition(id: string): Position {
        const node = this.nodes.get(id);
        if (!node) {
            throw Error(`Node with ID ${id} does not exist.`);
        }
        return node.graphics;
    }
    
    setPosition(id: string, pos: Position): void {
        const node = this.nodes.get(id);
        if (!node) {
            throw Error(`Node with ID ${id} does not exist.`);
        }
        node.graphics = pos;
    }

}

export { PetriNet, NodeType };
export type { State, Node, Arc, Position };

