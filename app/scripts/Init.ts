import 'chromereload/devonly';
import Node from './Node';
import {tabContainer} from './TabContainer';
import {windowContainer} from './WindowContainer';
import Window from './Window';

class ChromeCallbacks {

  static onMessage(message: any, sender: any, sendResponse: any) {
    console.log('OnMessage');
    if (message == 'getScreenState') {
      console.log('Screenstate');
    }
    console.log(message, sender, sendResponse);
  }

  static onTabCreated(tab: chrome.tabs.Tab) {
    const node = new Node(tab);
    tabContainer.add(node);

    // child tab created -> set parent and indent.
    if (tab.openerTabId) {
      const parentTab = tabContainer.get(tab.openerTabId);
      if (!parentTab) {
        // todo: query
      }

      node.parentTo(parentTab);
      node.renderIndentation();
      console.info('Child tab', node, 'parented to', parentTab);
    }
    // top level tab -> parent to window's root node
    else {
      const root = node.getWindow().root;
      node.parentTo(root);
      node.initialIndex = tab.index;
      console.info('Root tab ', node, ' parented to ', root);
    }
  }

  static onTabMoved(tabId:number, moveInfo:chrome.tabs.TabMoveInfo) {
    const node:Node = tabContainer.get(tabId);
    const root:Node = node.getWindow().root;

    // whether this was final move event made by Vivaldi
    const correctEvent = node.initialIndex === moveInfo.fromIndex;

    /// top level tab needs to repositioned outside existing branches
    if (node.parent.isRoot && correctEvent) {
      const searchBelow = moveInfo.toIndex; // search for spot below created tab
      let processed = 0;
      let minIndex:number;

      // This lags sometimes.
      // TODO: keep track of tab order to avoid api call?
      root.children.tabs.forEach((item) => {
        // get current index
        chrome.tabs.get(item.id, (tab:chrome.tabs.Tab) => {
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
    let newWindow = windowContainer.get(info.newWindowId);
    node.parentTo(newWindow.root);
    node.renderIndentation();
  }

  /*
  TODO: move children to new window with their parent?
   */
  static onTabDetached(tabId:number, _info:chrome.tabs.TabDetachInfo) {
    let node = tabContainer.get(tabId);
    node.children.tabs.forEach((child: Node) => {
      child.parentTo(node.parent);
      child.renderIndentation();
    });
  }

  static onWindowCreated(window:chrome.windows.Window) {
    let winObj = new Window(window);
    windowContainer.add(winObj);
  }

  static onWindowRemoved(windowId:number, filters:chrome.windows.WindowEventFilter|undefined) {
    let winObj = windowContainer.get(windowId);
    windowContainer.remove(winObj);
  }

  /*
  Handle messages send from external sources set in manifest.json.
  Current allowed sources: BrowserHook and testpage.html
   */

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
        case 'store':
          break;
        case 'CloseChildren':
          console.info('Close children called from browser.html for tab-id: ' + request.tab);
          const tabId = request.tabId;
          const node = tabContainer.get(tabId);

          if (node) {
            node.applyDescendants((child:Node) => {
              chrome.tabs.remove(child.id);
            });
          } else {
            console.error('Trying to close children of missing tab');
          }
          break;
      }
    }
  }

  /*
  Chrome extension shortcuts (not working)
   */
  static onCommand(command:any) {
    console.log('Received command:' + command);
    switch (command) {
      case 'close-child-tabs':
        console.log('Close child tabs shortcut');
        break;
      default:
        console.error('Unknown command');
        break;
    }
  }
} // end of ChromeCallBacks


// Initialize tab and window containers
chrome.windows.getAll(windowContainer.initFromArray.bind(windowContainer));
chrome.tabs.query({}, tabContainer.initFromArray.bind(tabContainer));

chrome.runtime.onMessage.addListener(ChromeCallbacks.onMessage);
chrome.runtime.onMessageExternal.addListener(ChromeCallbacks.onMessageExternal);
chrome.commands.onCommand.addListener(ChromeCallbacks.onCommand);
chrome.tabs.onCreated.addListener(ChromeCallbacks.onTabCreated);
chrome.tabs.onMoved.addListener(ChromeCallbacks.onTabMoved);
chrome.tabs.onRemoved.addListener(ChromeCallbacks.onTabRemoved);
chrome.tabs.onAttached.addListener(ChromeCallbacks.onTabAttached);
chrome.tabs.onDetached.addListener(ChromeCallbacks.onTabDetached);
chrome.windows.onCreated.addListener(ChromeCallbacks.onWindowCreated);
chrome.windows.onRemoved.addListener(ChromeCallbacks.onWindowRemoved);
