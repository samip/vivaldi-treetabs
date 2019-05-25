import Tab = chrome.tabs.Tab;
import {NodeList} from './NodeList';

export default class Node {
  id: Number|undefined;
  children: NodeList;
  parent: Node;

  constructor(tab: Tab) {
    console.log(tab.id);
    this.id = tab.id;
    this.children = new NodeList();
  }

  traverseUp() {
    let helper = function(i:any, c:any): any {
      if (i.parent) {
        return helper(i.parent, ++c);
      } else {
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
    if (this.parent) {
      // remove from parent's children
      this.parent.children.remove(this);
    }
    // reparent own children to own parent and redraw
    /*
    this.children.values.forEach( (childNode: Node) => {
        childNode.parentTo(this.parent);
        childNode.update();
    });
    */
    this.children.values.forEach( (childNode: Node) => {
        childNode.parentTo(this.parent);
    });

    this.parent.children.applyRecursive((child: Node) => {
        child.update();
    });

  }

  update() {
    chrome.runtime.sendMessage('mpognobbkildjkofajifpdfhcoklimli', {command: 'IndentTab', tabId: this.id, indentLevel: this.depth()});
  }

}

