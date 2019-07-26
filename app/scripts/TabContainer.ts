import Node from './Node';

export class TabContainer {

  tabs: Map<number, Node>;

  constructor() {
    this.tabs = new Map<number, Node>();
  }

  add(node:Node): void {
    let key = node.id;
    this.tabs.set(key, node);
  }

  get(id:number): Node {
    let node = this.tabs.get(id);
    if (!node) {
      throw new Error('Invalid access for node id' + id);
    }
    return node;
  }

  remove(node:Node) {
    let key = node.id;
    if (!this.tabs.has(key)) {
      throw new Error('Invalid node access on TabContainer.remove()' + key);
    }
    this.tabs.delete(key);
  }

  initFromArray(tabs:chrome.tabs.Tab[]) {
    let parentQueue = new Map<number, Array<Node>>();

    tabs.forEach((tab:chrome.tabs.Tab) => {
      let tabObj = new Node(tab);
      if (tab.openerTabId) {
        let parent = this.get(tab.openerTabId);
        // parent already in container -> reparent normally
        if (parent) {
          tabObj.parentTo(parent);
        }
        // parent not yet in container -> parent this once parent is created
        else {
          if (!parentQueue.has(tab.openerTabId)) {
            parentQueue.set(tab.openerTabId, []);
          }
          // should be just parentQueue.get(tab.openerTabId).push(tabObj)
          let siblingparentQueue = parentQueue.get(tab.openerTabId);

          if (siblingparentQueue) {
            siblingparentQueue.push(tabObj);
          } else {
            throw new Error('???');
          }
        }
      }
      // root tab -> parent to own window's root node
      else {
        let window = tabObj.getWindow();
        tabObj.parentTo(window.root);
      }

      let queueForThis = parentQueue.get(tabObj.id);
      if (queueForThis) {
        // children were created first -> parent them
        queueForThis.forEach((node:Node) => {
          node.parentTo(tabObj);
        });
      }

      this.add(tabObj);
    });
  }
}

export let tabContainer = new TabContainer();
