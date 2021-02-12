import 'chromereload/devonly'
import Tab from './Tab'
import {tabContainer} from './TabContainer'
import {windowContainer} from './WindowContainer'
import Window from './Window'

class ChromeCallbacks {

  static onMessage(message: any, sender: any, sendResponse: any) {
    console.log('onMessage', message, sender, sendResponse)
  }

  static onTabCreated(tab: chrome.tabs.Tab) {
    const node = new Tab(tab)
    tabContainer.add(node)

    // child tab created -> set parent and indent.
    if (tab.openerTabId) {
      const parentTab = tabContainer.get(tab.openerTabId)
      node.parentTo(parentTab)
      node.renderIndentation()
      console.info('Child tab', node, 'parented to', parentTab)
    }
    // top level tab -> parent to window's root node
    else {
      const root = node.getWindow().root
      node.parentTo(root)
      node.initialIndex = tab.index
      console.info('Root tab ', node, ' parented to ', root)
    }
  }

  static onTabMoved(tabId:number, moveInfo:chrome.tabs.TabMoveInfo) {
    const node:Tab = tabContainer.get(tabId)
    const root:Tab = node.getWindow().root

    // whether this was final move event made by Vivaldi
    const correctEvent = node.initialIndex === moveInfo.fromIndex

    /// top level tab needs to repositioned outside existing branches
    if (node.parent.isRoot && correctEvent) {
      const searchBelow = moveInfo.toIndex // search for spot below created tab
      let processed = 0
      let minIndex:number

      // This lags sometimes.
      // TODO: keep track of tab order to avoid api call?
      root.children.tabs.forEach((item) => {
        // get current index
        chrome.tabs.get(item.id, (tab:chrome.tabs.Tab) => {
          let prev = --tab.index

          if (prev > searchBelow) {
            if (!minIndex || prev <= minIndex) {
              minIndex = prev
            }
          } else if (prev === searchBelow) {
            minIndex = prev
            return
          }

          processed++

          if (processed === root.children.tabs.size) {
            minIndex = (minIndex) ? minIndex : 999
            chrome.tabs.move([item.id], {index: minIndex})
          }
        })
      })
    }
  }

  static onTabRemoved(tabId:number) {
    const node = tabContainer.get(tabId)
    node.remove()
    tabContainer.remove(node)
  }

  /*
    Tab moved to new window -> reparent to new Window's root
   */
  static onTabAttached(tabId:number, info:chrome.tabs.TabAttachInfo) {
    const node = tabContainer.get(tabId)
    const newWindow = windowContainer.get(info.newWindowId)
    node.parentTo(newWindow.root)
    node.renderIndentation()
  }

  /*
  TODO: move children to new window with their parent?
   */
  static onTabDetached(tabId:number, _info:chrome.tabs.TabDetachInfo) {
    const node = tabContainer.get(tabId)
    node.children.tabs.forEach((child: Tab) => {
      child.parentTo(node.parent)
      child.renderIndentation()
    })
  }

  /*
  https://developer.chrome.com/docs/extensions/reference/tabs/#event-onUpdated
  */
  static onTabUpdated(tabId:number, info:chrome.tabs.TabChangeInfo) {
    if (info.pinned) {
      // Tab pinned -> parent children to tab's parent
      const node = tabContainer.get(tabId)
      node.children.tabs.forEach((child: Tab) => child.parentTo(node.parent).renderIndentation())
      // Parent tab to window root
      // TODO: fix
      node.parentTo(node.getWindow().root)
    }
  }

  static onWindowCreated(window:chrome.windows.Window) {
    const winObj = new Window(window)
    windowContainer.add(winObj)
  }

  static onWindowRemoved(windowId:number, _filters:chrome.windows.WindowEventFilter|undefined) {
    const winObj = windowContainer.get(windowId)
    windowContainer.remove(winObj)
  }


  /*
  Chrome extension shortcuts (not working)
   */
  static onCommand(command:any) {
    console.log('Received command:' + command)
    switch (command) {
      case 'close-child-tabs':
        console.log('Close child tabs shortcut')
        break
      default:
        console.error('Unknown command')
        break
    }
  }
} // end of ChromeCallBacks


// Initialize tab and window containers
chrome.windows.getAll(windowContainer.initFromArray.bind(windowContainer))
chrome.tabs.query({}, tabContainer.initFromArray.bind(tabContainer))

chrome.runtime.onMessage.addListener(ChromeCallbacks.onMessage)
chrome.commands.onCommand.addListener(ChromeCallbacks.onCommand)
chrome.tabs.onCreated.addListener(ChromeCallbacks.onTabCreated)
chrome.tabs.onMoved.addListener(ChromeCallbacks.onTabMoved)
chrome.tabs.onRemoved.addListener(ChromeCallbacks.onTabRemoved)
chrome.tabs.onAttached.addListener(ChromeCallbacks.onTabAttached)
chrome.tabs.onDetached.addListener(ChromeCallbacks.onTabDetached)
chrome.tabs.onUpdated.addListener(ChromeCallbacks.onTabUpdated)
chrome.windows.onCreated.addListener(ChromeCallbacks.onWindowCreated)
chrome.windows.onRemoved.addListener(ChromeCallbacks.onWindowRemoved)
