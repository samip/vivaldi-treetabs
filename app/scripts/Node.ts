import {TabContainer} from './TabContainer';
import Command from './Command';
import Window from './Window';
import {windowContainer} from './WindowContainer';

export type NodeCallback = (node: Node) => any;

/*
Represents either tab or Window's root node
*/

export default class Node {

  /*
  The ID of the tab. Tab IDs are unique within a browser session.
  Under some circumstances a tab may not be assigned an ID; for example, when querying foreign tabs using the sessions API,
  in which case a session ID may be present. Tab ID can also be set to chrome.tabs.TAB_ID_NONE for apps and devtools windows.
   */
  id: number;
  tab: chrome.tabs.Tab; // https://developer.chrome.com/extensions/tabs
  children: TabContainer;
  parent: Node;
  waitingForRepositioning: boolean;
  initialIndex: number; // Index (from top to bottom) of tab when it was created
  isRoot: boolean;

  constructor(tab?: chrome.tabs.Tab) {
    if (tab) {
      if (tab.id) {
        this.id = tab.id;
      } else {
        // should never happen
        throw new Error('No tab id');
      }
      this.tab = tab;
    } else {
      this.isRoot = true;
      this.id = 0;
    }

    this.children = new TabContainer();
    this.waitingForRepositioning = false;
  }


  calculateDistanceToRoot() {
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
  command(command: string, parameters:any={}) {
    parameters['tabId'] = this.id;
    let cmd = new Command(command, parameters);
    cmd.send();
    return cmd;
  }

  /** Get level of indentation required for tab. **/
  depth(): number {
    return this.calculateDistanceToRoot();
  }

  /** Get tab's Window object **/
  getWindow(): Window {
    let windowId = this.tab.windowId;
    let window = windowContainer.get(windowId);
    if (!window) {
      throw new Error('Window not in container');
    }
    return window;
  }

  /** Set parent **/
  parentTo(parent: Node) {
    /*
    if (this.parent) {
      this.parent.children.remove(this);
    }
    */

    // add node to new parent's child list
    parent.children.add(this);
    this.parent = parent;
    // has children now -> show close children button
    parent.command('showCloseChildrenButton');
  }

  /** Call function on every child and grandchild of Node **/
  applyChildren(callback: NodeCallback) {
    this.children.tabs.forEach( (node:Node, key:number) => {
      callback(node);
      return node.applyChildren(callback);
    });
  }

  /** Remove tab and parent it's children to own parent **/
  remove() {
    // parent removed tab's children to own parent and redraw
    this.applyChildren((child:Node) => {
      if (child.parent.id === this.id) {
        child.parentTo(this.parent);
      }
      child.renderIndentation();
    });

    this.parent.children.remove(this); // remove from parent's children

    // only child was removed -> hide close children button
    if (this.parent.children.isEmpty()) {
      this.parent.command('hideCloseChildrenButton');
    }
  }

  /*** Send IndentTab command to BrowserHook ***/
  renderIndentation() {
    let depth = this.depth();
    this.command('IndentTab', {'indentLevel' :depth});
  }

}
