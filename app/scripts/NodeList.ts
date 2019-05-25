import Node from './Node';

export type NodeCallback = (node: Node) => any;

export class NodeList {

  nodes: { [s: string]: Node; } = <any>{};
  values: Node[] = [];
  keys: string[] = [];
  constructor() {

  }

  add(node: Node) {
    let key = '' + node.id;
    this.nodes[key] = node;
    this.keys.push(key);
    this.values.push(node);
  }

  applyRecursive(callback: NodeCallback) {
    this.values.forEach( (childNode: Node) => {
        console.log(childNode, callback);
        callback(childNode);
        childNode.children.applyRecursive(callback);
    });
  }

  remove(node: Node) {
    let key = ''+node.id;
    let index = this.keys.indexOf(key, 0);
    this.keys.splice(index, 1);
    this.values.splice(index, 1);
    delete this.nodes[key];
  }

  get(id: Number): Node {
    return this.nodes['' + id];
  }

  init() {

  }

  dump() {
    console.log(this.nodes);
  }
}

export let nodelist = new NodeList();
