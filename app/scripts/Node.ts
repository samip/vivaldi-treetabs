import Tab = chrome.tabs.Tab;
import {tabContainer, TabContainer} from './TabContainer';
import Command from './Command';
import Window from './Window';
import {windowContainer} from './WindowContainer';

export type NodeCallback = (node: Node) => any;

interface IRawParams {
    [id: string]: any;
}

export default class Node implements IRawParams {
  [k: string]: any;
  id: number;
  title: string|undefined;
  children: TabContainer;
  tab: Tab;
  parent: Node;
  waitingForRepositioning: boolean;
  firstPassGone: boolean;
  initialIndex: number;
  initialNodeValues: Node[];
  repositionNext:boolean;

  constructor(tab?: Tab) {
    if (!tab) {
      console.log('created root');
      this.id = 0;
    } else {
      if (tab.id) {
        this.id = tab.id;
      } else {
        throw new Error('No tab id');
      }
      this.tab = tab;
      this.title = tab.title;
    }

    this.children = new TabContainer();
    this.waitingForRepositioning = false;
    this.firstPassGone = false;
    this.initialNodeValues = [];
    this.repositionNext = false;
  }

  traverseUp() {
    let helper = function(i:any, c:any): any {
      if (i.parent) {
        if (i.parent.id === 0) {
          return helper(i.parent, c);
        } else {
          return helper(i.parent, ++c);
        }
      } else {
        return c;
      }
    };

    return helper(this, 0);
  }

  command(command: string, parameters:any={}) {
    parameters['tabId'] = this.id;
    let obj = new Command(command, parameters);
    obj.send();
    return obj;
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
    return this.parent.children.get(compare.id) !== null;
  }


  depth(): number {
    return this.traverseUp();
  }

  getWindow(): Window {
    let windowId = this.tab.windowId;
    let window = windowContainer.getById(windowId);
    if (!window) {
      throw new Error('Window not in container');
    }
    return window;
  }

  parentTo(parent: Node) {
    // already had parent -> remove from child list
    if (this.parent) {
      /*
      Tämä kai rikkoo reparentin kun koko child node poistetaan?
      this.parent.children.remove(this);
       */
    }
    // add to new parent's child list
    parent.children.add(this);
    this.parent = parent;
  }

  applyChildren(callback: NodeCallback) {
    /*
    let count = this.values.length;

    this.values.forEach( (childNode: Node) => {
      callback(childNode);
      return childNode.children.applyRecursive(callback);
    });
    */

    this.children.tabs.forEach( (node:Node, key:number) => {
      callback(node);
      return node.applyChildren(callback);
    });

  }

  remove() {
    // reparent own children to own parent and redraw

    this.applyChildren((child:Node) => {
      child.parentTo(this.parent);
      child.update();
    });
    /*
    this.children.applyRecursive((child: Node) => {

      if (child.parent && child.parent.id === this.id) {
        child.parentTo(this.parent);
        console.log(child.id, 'parented to ', (this.parent) ? this.parent.id : 'root');
      } else {
        console.error('Misparented', child);
      }

      console.log(child.id, 'depth', child.depth());
      console.log(child.id, 'parent', child.parent);
      child.update();
    });
    */

    this.parent.children.remove(this);
    // tabContainer.remove(this);
  }

  update() {
    let depth = this.depth();
    console.log('Update ' + this + ' depth ' + depth);
    chrome.runtime.sendMessage('mpognobbkildjkofajifpdfhcoklimli',
      {
        'command': 'IndentTab',
        'tabId': this.id,
        'indentLevel': depth
      });
  }

}

export let rootNode:Node = new Node();
