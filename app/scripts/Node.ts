import {TabContainer} from './TabContainer';
import Command from './Command';
import Window from './Window';
import {windowContainer} from './WindowContainer';

export type NodeCallback = (node: Node) => any;

interface IRawParams {
    [id: string]: any;
}

export default class Node implements IRawParams {
  [k: string]: any;

  /*
  The ID of the tab. Tab IDs are unique within a browser session.
  Under some circumstances a tab may not be assigned an ID; for example, when querying foreign tabs using the sessions API,
  in which case a session ID may be present. Tab ID can also be set to chrome.tabs.TAB_ID_NONE for apps and devtools windows.
   */
  id: number;
  children: TabContainer;
  tab: chrome.tabs.Tab;
  parent: Node;
  waitingForRepositioning: boolean;
  initialIndex: number;

  constructor(tab?: chrome.tabs.Tab) {
    if (!tab) {
      this.id = 0;
    } else {
      if (tab.id) {
        this.id = tab.id;
      } else {
        // should never happen
        throw new Error('No tab id');
      }

      this.tab = tab;
    }
    this.children = new TabContainer();
    this.waitingForRepositioning = false;
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

  /** Send tab specific command to Browserhook **/
  command(command: string, parameters:any={}) {
    parameters['tabId'] = this.id;
    let obj = new Command(command, parameters);
    obj.send();
    return obj;
  }

  /** Get level of indentation required for tab. **/
  depth(): number {
    return this.traverseUp();
  }

  /** Get tab's Window object **/
  getWindow(): Window {
    let windowId = this.tab.windowId;
    let window = windowContainer.getById(windowId);
    if (!window) {
      throw new Error('Window not in container');
    }
    return window;
  }

  /** Set parent **/
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
    parent.command('showCloseChildrenButton');
  }

  /** Call function for each children and grandchildren of Tab **/
  applyChildren(callback: NodeCallback) {
    this.children.tabs.forEach( (node:Node, key:number) => {
      callback(node);
      return node.applyChildren(callback);
    });
  }

  /** Remove tab and parent it's children to own parent **/
  remove() {
    // reparent own children to own parent and redraw
    this.applyChildren((child:Node) => {
      if (child.parent.id === this.id) {
        child.parentTo(this.parent);
      }
      child.renderIndentation();
    });

    this.parent.children.remove(this); // remove from parent's children
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
