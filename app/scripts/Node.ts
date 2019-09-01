import {TabContainer} from './TabContainer';
import Command from './Command';
import Window from './Window';
import {windowContainer} from './WindowContainer';

export type NodeCallback = (node: Node) => any;

/*
Represents either tab or Window's root node
*/

export default class Node {

  id: number;
  tab: chrome.tabs.Tab; // https://developer.chrome.com/extensions/tabs
  children: TabContainer;
  parent: Node;
  initialIndex: number; // Index (from top to bottom) of tab when it was created
  isRoot: boolean;

  constructor(tab?: chrome.tabs.Tab) {
    if (tab) {
      if (tab.id) {
        this.id = tab.id;
      } else {
        // "Under some circumstances a tab may not be assigned an ID; for example,
        // when querying foreign tabs using the sessions API"
        // should never happen here
        throw new Error('No tab id');
      }
      this.tab = tab;
    } else {
      this.isRoot = true;
      this.id = 0;
    }

    this.children = new TabContainer();
  }


  /** Call function on every descendant of Node **/
  applyDescendants(callback: NodeCallback): void {
    this.children.tabs.forEach( (node:Node, key:number) => {
      callback(node);
      return node.applyDescendants(callback);
    });
  }

  /*** Traverse to root, return distance  ***/
  calculateDistanceToRoot(): number {
    let helper = function(node:Node, distance:number): any {
      if (node.parent) {
        if (node.parent.isRoot) {
          return helper(node.parent, distance);
        } else {
          return helper(node.parent, ++distance);
        }
      } else {
        return distance;
      }
    };

    return helper(this, 0);
  }

  /** Send tab specific command to Browserhook **/
  command(command: string, parameters:any={}): void {
    parameters['tabId'] = this.id;
    const cmd = new Command(command, parameters);
    cmd.send();
  }

  /** Get level of indentation required for tab **/
  depth(): number {
    return this.calculateDistanceToRoot();
  }

  /** Get tab's Window object **/
  getWindow(): Window {
    const windowId = this.tab.windowId;
    return windowContainer.get(windowId);
  }

  /** Set parent **/
  parentTo(parent: Node): void {
    /*
    if (this.parent) {
      this.parent.children.remove(this);
    }
    */

    // Add node to new parent's child list
    parent.children.add(this);
    this.parent = parent;
    // Has children now -> show close children button
    if (!parent.isRoot) {
      parent.command('showCloseChildrenButton');
    }
  }


  /** Remove tab and parent it's children to own parent **/
  remove(): void {
    // Parent removed tab's children to own parent and redraw
    this.applyDescendants((child:Node) => {
      // Reparent direct children
      if (child.parent.id === this.id) {
        child.parentTo(this.parent);
      }
      // Re-render all descendants since their indentation has changed, while parent stayed the same.
      child.renderIndentation();
    });

    this.parent.children.remove(this); // remove from parent's children

    // only child was removed -> hide close children button
    if (!this.parent.isRoot && this.parent.children.isEmpty()) {
      this.parent.command('hideCloseChildrenButton');
    }
  }

  removeChildren(): void {
    this.applyDescendants((child:Node) => {
      chrome.tabs.remove(child.id);
    });
  }

  /*** Send IndentTab command to BrowserHook ***/
  renderIndentation(): void {
    const depth = this.depth();
    this.command('IndentTab', {'indentLevel': depth});
  }

}
