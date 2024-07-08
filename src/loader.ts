import sax from 'sax';
import { PetriNet } from './petriNetModel';

export function loadPetriNet(content: string): PetriNet {
    const parser = new PNMLParser();
    const petriNet = parser.parse(content);
    return petriNet;
}

class PNMLParser {
    private parser: sax.SAXParser;
    private net: PetriNet;
    private stack: any[];
    private index: { [id: string]: any };
    private inToolspecific: boolean;
    private currentElement: string | null;

    constructor() {
        this.parser = sax.parser(true);
        this.net = new PetriNet();
        this.stack = [];
        this.index = {};
        this.inToolspecific = false;
        this.currentElement = null;

        this.parser.onopentag = this.startElement.bind(this);
        this.parser.onclosetag = this.endElement.bind(this);
        this.parser.ontext = this.charData.bind(this);
    }

    parse(content: string): PetriNet {
        this.parser.write(content).close();
        return this.net;
    }

    private startElement(node: sax.Tag): void {
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
            try {
                this.net.addArc(source, target, 1);
            } catch (error) {
                console.error(`Error adding arc from ${source} to ${target}:`, error);
            }
        } else if (node.name === "initialMarking") {
            this.currentElement = "initialMarking";
        } else if (node.name === "toolspecific") {
            this.inToolspecific = true;
        }
    }

    private endElement(name: string): void {
        if (name === "toolspecific") {
            this.inToolspecific = false;
            return;
        }

        if (this.inToolspecific) {
            return;
        }

        if (name === "place") {
            const place = this.stack.pop();
            if (place) {
                this.net.addPlace(place.id, place.tokens !== undefined && place.tokens !== null ? place.tokens : 0);
            }
        } else if (name === "transition") {
            const transition = this.stack.pop();
            if (transition) {
                this.net.addTransition(transition.id);
            }
        } else if (name === "initialMarking") {
            this.currentElement = null;
        }
    }

    private charData(text: string): void {
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
                }
            }
        }
    }
}
