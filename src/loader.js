import sax from 'sax';
import { PetriNet } from './petriNetModel';

export function loadPetriNet(content) {
    const parser = new PNMLParser();
    const petriNet = parser.parse(content);
    return petriNet;
}

class PNMLParser {
    constructor() {
        this.parser = sax.parser(true);
        this.net = new PetriNet();
        this.stack = [];
        this.index = {};
        this.inToolspecific = false;

        this.parser.onopentag = this.startElement.bind(this);
        this.parser.onclosetag = this.endElement.bind(this);
        this.parser.ontext = this.charData.bind(this);
    }

    parse(content) {
        this.parser.write(content).close();
        return this.net;
    }

    startElement(node) {
        if (this.inToolspecific) {
            return;
        }

        if (node.name === "net") {
            this.stack.push(this.net);
        } else if (node.name === "place") {
            const id = node.attributes.id;
            this.index[id] = { id, tokens: 0 };
            this.stack.push(this.index[id]);
        } else if (node.name === "transition") {
            const id = node.attributes.id;
            this.index[id] = { id };
            this.stack.push(this.index[id]);
        } else if (node.name === "arc") {
            const source = node.attributes.source;
            const target = node.attributes.target;
            this.net.addArc(source, target, 1);
        } else if (node.name === "initialMarking") {
            this.currentElement = "initialMarking";
        } else if (node.name === "toolspecific") {
            this.inToolspecific = true;
        }
    }

    endElement(name) {
        if (name === "toolspecific") {
            this.inToolspecific = false;
            return;
        }

        if (this.inToolspecific) {
            return;
        }

        if (name === "place") {
            const place = this.stack.pop();
            this.net.addPlace(place.id, place.id, place.tokens !== undefined && place.tokens !== null ? place.tokens : 0);
        } else if (name === "transition") {
            const transition = this.stack.pop();
            this.net.addTransition(transition.id, transition.id);
        } else if (name === "initialMarking") {
            this.currentElement = null;
        }
    }

    charData(text) {
        if (this.inToolspecific) {
            return;
        }

        if (this.currentElement === "initialMarking") {
            const currentItem = this.stack[this.stack.length - 1];
            const trimmedText = text.trim();
            if (trimmedText !== '') {
                const tokens = parseInt(trimmedText, 10);
                if (!isNaN(tokens)) {
                    currentItem.tokens = tokens;
                    // console.log("Initial marking: ", currentItem.tokens, " from text : ", trimmedText);
                } else {
                    // console.log("Ignored invalid number: ", trimmedText);
                }
            }
        }
    }
}
