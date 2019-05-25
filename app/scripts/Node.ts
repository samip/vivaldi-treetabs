import Tab = chrome.tabs.Tab;
import {NodeList} from './NodeList';

export default class Node {
  id: Number|undefined;
  children: NodeList;
  parent: Node;

  constructor(tab: Tab) {
    this.id = tab.id;
    this.children = new NodeList();
  }

  traverseUp() {
    let helper = function(i:any, c:any): any {
      console.log(i, i.parent);
      if (i.parent) {
        return helper(i.parent, ++c);
      } else {
        console.log('end', c);
        return c;
      }
    };

    return helper(this, 0);
  }

  depth(): number {
    return this.traverseUp();
  }

  parentTo(parent: Node) {
    // Remove from old parent's children
    if (this.parent) {
      this.parent.children.remove(this);
    }

    if (parent) {
      parent.children.add(this);
    }
    // allow setting null (root tab)
    this.parent = parent;

    // update children
  }

  remove() {
    // Remove from old parent's children
    if (this.parent) {
      this.parent.children.remove(this);
    }
    // update children
  }

}

