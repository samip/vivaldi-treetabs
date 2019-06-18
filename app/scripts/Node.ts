import Tab = chrome.tabs.Tab;
import {NodeList} from './NodeList';

interface IRawParams {
    [id: string]: any;
}

export default class Node implements IRawParams {
  [k: string]: any;
  id: number;
  title: string|undefined;
  children: NodeList;
  tab: Tab;
  parent?: Node;
  waitingForRepositioning: boolean;

  constructor(tab: Tab) {
    if (tab.id) {
      this.id = tab.id;
    } else {
      throw new Error('No tab id');
    }
    this.tab = tab;
    this.title = tab.title;
    this.children = new NodeList();
    this.waitingForRepositioning = false;
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

  isRoot(): boolean {
    if (this.tab) {
      return !this.tab.openerTabId;
    } else {
      return false;
    }
    // return !this.parent;
  }

  isSibling(compare: Node): boolean {
    if (this.parent) {
      let sameParent = this.parent.children.get(compare.id) !== null;
      console.log(sameParent);
      return sameParent;
    }
    // both roots -> siblings
    return false;
  }

  siblings(): NodeList {
    if (this.parent) {
      return this.parent.children;
    }
    return new NodeList();
  }

  depth(): number {
    return this.traverseUp();
  }

  parentTo(parent?: Node) {
    // Remove from old parent's children
    if (this.parent) {
      this.parent.children.remove(this);
    }

    if (parent) {
      parent.children.add(this);
    }
    // allow setting null (root tab)
    this.parent = parent;

    if (this.parent) {
      this.parent.children.applyRecursive((child: Node) => {
        child.update();
      });
    }
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
        childNode.update();
    });

    if (this.parent) {
      this.parent.children.applyRecursive((child: Node) => {
        child.update();
      });
    }

  }

  update() {
    chrome.runtime.sendMessage('mpognobbkildjkofajifpdfhcoklimli', {command: 'IndentTab', tabId: this.id, indentLevel: this.depth()});
  }

}

