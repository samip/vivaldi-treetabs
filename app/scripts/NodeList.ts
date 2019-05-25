import Node from './Node';



export class NodeList {

  nodes: { [s: string]: Node; } = <any>{};

  constructor() {

  }

  add(node: Node) {
    console.log(node);
    this.nodes[''+node.id] = node;
  }

  remove(node: Node) {
    delete this.nodes[''+node.id];
  }

  get(id: Number): Node {
    return this.nodes[''+id];
  }

  init() {

  }

  dump() {
    console.log(this.nodes);
  }
}

export let nodelist = new NodeList();
