class Graphics {
    constructor() {
        this.positions = new Map(); // Stores positions keyed by node ID
    }

    setPosition(id, x, y) {
        this.positions.set(id, { x, y });
    }

    getPosition(id) {
        return this.positions.get(id) || { x: 0, y: 0 };
    }

    getAllPositions() {
        return this.positions;
    }
}

export { Graphics };
