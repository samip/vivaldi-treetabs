import 'chromereload/devonly';
import Node from './Node';
import {windowContainer} from './WindowContainer';
import Window from './Window';
import {tabContainer} from './TabContainer';
import WindowEventFilter = chrome.windows.WindowEventFilter;

class ChromeCallbacks {

  static onMessageExternal(request:any, sender:any, sendResponse:any) {
    console.log('external received in background', request, sender);

    if (request.command) {
      switch (request.command) {
        case 'build':
          // async. wrap in promises?
          chrome.windows.getAll(windowContainer.initFromArray.bind(windowContainer));
          chrome.tabs.query({}, tabContainer.initFromArray.bind(tabContainer));
          sendResponse({'tabContainer': tabContainer, 'windowContainer': windowContainer});
          break;
        case 'get':
          sendResponse({'tabContainer': tabContainer});
          break;
        case 'show_ids':
          tabContainer.tabs.forEach((node:Node) => {
            node.command('ShowId');
          });
          break;
        case 'element':
          let first = tabContainer.tabs.values().next().value;
          let ret = first.command('getElement');
          console.log('test', ret);
          break;
        case 'store':
          break;
      }
    }
  }

  static onCommand(command:any) {
    let log = (message:string) => {
     let enabled = true;
     if (enabled) {
       console.log(message);
     }
    };
    log('Received command:' + command);
    switch (command) {
      case 'close-child-tabs':
        log('Close child tabs');
        console.log('Close child tabs shortcut');
        break;
      default:
        console.error('Unknown command');
        break;
    }
  }

  static onTabCreated(tab: chrome.tabs.Tab) {
    let node = new Node(tab);
    tabContainer.add(node);

    // child tab created. set it's parent tab and indent it.
    if (tab.openerTabId) {
      let parentNode = tabContainer.get(tab.openerTabId);
      if (parentNode) {
        node.parentTo(parentNode);
      } else {
        console.log(parentNode, tabContainer.tabs, tab.openerTabId);
        throw new Error('Parent not in container'); // todo: handle better
      }

      let parentTab = tabContainer.get(tab.openerTabId);
      node.parentTo(parentTab);
      // node.command('IndentTab', {tabId: tab.id, indentLevel: node.depth()});
      node.renderIndentation();
      console.log('Child tab', node, 'parented to', parentTab);
    }
    // top level tab -> parent to window's root node
    else {
      let root = node.getWindow().root;
      node.parentTo(root);
      node.initialIndex = tab.index;
      node.waitingForRepositioning = true;
      console.log('Root tab ', node, ' parented to ', root);
    }
  }

  static onTabMoved(tabId:number, moveInfo:chrome.tabs.TabMoveInfo) {
    let node:Node = tabContainer.get(tabId);
    let root:Node = node.getWindow().root;
    const correctEvent = node.initialIndex === moveInfo.fromIndex; // whether this was final move event

    if (node.waitingForRepositioning && correctEvent) {
      let searchBelow = moveInfo.toIndex; // search for spot below created tab
      let processed = 0;
      let minIndex:number;

      // TODO(?): keep track of tab index to avoid api call
      chrome.tabs.get(tabId, (tab:chrome.tabs.Tab) => {
        root.children.tabs.forEach((item) => {
          chrome.tabs.get(item.id, (tab:chrome.tabs.Tab) => {
            if (tab.openerTabId) {
              console.error('Root not root', tab);
            }
            tabContainer.get(item.id).command('appendAttribute', {attribute:'style', values: 'background-color:red'});
            let prev = --tab.index;
            if (prev > searchBelow) {
              if (!minIndex || prev <= minIndex) {
                minIndex = prev;
              }
            } else if (prev === searchBelow) {
              minIndex = prev;
              console.log('exit untouched at ', prev);
              return;
            }

            processed++;

            if (processed === root.children.tabs.size) {
              minIndex = (minIndex) ? minIndex : 999;
              chrome.tabs.move([item.id], {index: minIndex});
            }
          });
        });
      });
    }
  }


  static onTabRemoved(tabId:number) {
    let node = tabContainer.get(tabId);
    node.remove();
    tabContainer.remove(node);
  }


  /*
  Tab moved to new window -> reparent to new Window's root
   */
  static onTabAttached(tabId:number, info:chrome.tabs.TabAttachInfo) {
    let node = tabContainer.get(tabId);
    let newWindow = windowContainer.getById(info.newWindowId);
    node.parentTo(newWindow.root);
    node.renderIndentation();
  }

  ///
  static onTabDetached(tabId:number, info:chrome.tabs.TabDetachInfo) {
    let node = tabContainer.get(tabId);
    node.children.tabs.forEach((child: Node, key: number) => {
      child.parentTo(node.parent);
      child.renderIndentation();
    });
  }

  static onWindowCreated(window:chrome.windows.Window) {
    let winObj = new Window(window);
    windowContainer.add(winObj);
  }

  static onWindowRemoved(windowId:number, filters:WindowEventFilter|undefined) {
    let winObj = windowContainer.getById(windowId);
    windowContainer.remove(winObj);
  }


} // end of ChromeCallBacks



chrome.windows.getAll(windowContainer.initFromArray.bind(windowContainer));
chrome.tabs.query({}, tabContainer.initFromArray.bind(tabContainer));
chrome.runtime.onMessageExternal.addListener(ChromeCallbacks.onMessageExternal);
chrome.commands.onCommand.addListener(ChromeCallbacks.onCommand);
chrome.tabs.onCreated.addListener(ChromeCallbacks.onTabCreated);
chrome.tabs.onMoved.addListener(ChromeCallbacks.onTabMoved);
chrome.tabs.onRemoved.addListener(ChromeCallbacks.onTabRemoved);
chrome.tabs.onAttached.addListener(ChromeCallbacks.onTabAttached);
chrome.tabs.onDetached.addListener(ChromeCallbacks.onTabDetached);
chrome.windows.onCreated.addListener(ChromeCallbacks.onWindowCreated);
chrome.windows.onRemoved.addListener(ChromeCallbacks.onWindowRemoved);
