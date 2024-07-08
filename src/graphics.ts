interface Position {
    x: number;
    y: number;
}

class Graphics {
    private positions: Map<string, Position>;

    constructor() {
        this.positions = new Map(); // Stores positions keyed by node ID
    }

    setPosition(id: string, x: number, y: number): void {
        this.positions.set(id, { x, y });
    }

    getPosition(id: string): Position {
        return this.positions.get(id) || { x: 0, y: 0 };
    }

    getAllPositions(): Map<string, Position> {
        return this.positions;
    }
}

export { Graphics };
