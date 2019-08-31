import Node from './Node';

export class TabContainer {

  tabs: Map<number, Node>;

  constructor() {
    this.tabs = new Map<number, Node>();
  }

  add(node:Node): void {
    this.tabs.set(node.id, node);
  }

  get(id:number): Node {
    let node = this.tabs.get(id);
    if (!node) {
      throw new Error('Invalid access for node id' + id);
    }
    return node;
  }

  getFirst(): Node {
    return this.tabs.values().next().value;
  }

  remove(node:Node) {
    if (this.tabs.get(node.id)) {
      this.tabs.delete(node.id);
    }
  }

  isEmpty(): boolean {
    return this.tabs.size === 0;
  }

  /// Create nodes and their relationships
  initFromArray(tabs:chrome.tabs.Tab[]) {
    const parentQueue = new Map<number, Array<Node>>();

    tabs.forEach((tab:chrome.tabs.Tab) => {
      const tabObj = new Node(tab);

      // Parent already in container -> set parent normally
      if (tab.openerTabId) {
        let parent = this.get(tab.openerTabId);

        if (parent) {
          tabObj.parentTo(parent);
        }

        // parent not yet in container. Wait for it to be created
        else {
          if (!parentQueue.has(tab.openerTabId)) {
            parentQueue.set(tab.openerTabId, []);
          }
          // should be just parentQueue.get(tab.openerTabId).push(tabObj)
          const siblingparentQueue = parentQueue.get(tab.openerTabId);

          if (siblingparentQueue) {
            siblingparentQueue.push(tabObj);
          }
        }
      }
      // Top level tab -> parent to window's root node
      else {
        let window = tabObj.getWindow();
        tabObj.parentTo(window.root);
      }

      const queueForThis = parentQueue.get(tabObj.id);
      if (queueForThis) {
        // Children were created first -> parent them
        queueForThis.forEach((node:Node) => {
          node.parentTo(tabObj);
        });
      }
      this.add(tabObj);
    });
  }
}

export let tabContainer = new TabContainer(); // Contains tabs from every window
