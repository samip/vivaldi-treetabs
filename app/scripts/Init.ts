import 'chromereload/devonly' // Remove this before building
import Tab from './Tab'
import {tabContainer} from './TabContainer'
import {windowContainer} from './WindowContainer'
import Window from './Window'

class ChromeCallbacks {

  static onTabCreated(chromeTab: chrome.tabs.Tab) {
    const tab = new Tab(chromeTab)
    tabContainer.add(tab)

    // child tab created -> set parent and indent.
    if (chromeTab.openerTabId) {
      const parentTab = tabContainer.get(chromeTab.openerTabId)
      tab.parentTo(parentTab)
      tab.renderIndentation()
    }
    // top level tab -> parent to window's root node
    else {
      const root = tab.getWindow().root
      tab.parentTo(root)
    }
  }

  static onTabMoved(tabId:number, info:chrome.tabs.TabMoveInfo) {
    const tab:Tab = tabContainer.get(tabId)
    const root:Tab = tab.getWindow().root

    // whether this was final move event made by Vivaldi
    const correctEvent = tab.initialIndex === info.fromIndex

    // top level tab needs to repositioned outside existing branches
    if (tab.parent.isRoot && correctEvent) {
      const searchBelow = info.toIndex // search for spot below created tab
      let processed = 0
      let minIndex:number

      // This lags sometimes.
      // TODO: keep track of tab order to avoid api call?
      // TODO: Figure out what this does and rewrite
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
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError)
        }
      })
    }
  }

  static onTabRemoved(tabId:number) {
    const tab = tabContainer.get(tabId)
    if (!tab) return

    tab.remove()
    tabContainer.remove(tab)
  }

  // Tab moved to new window -> reparent to new Window's root
  static onTabAttached(tabId:number, info:chrome.tabs.TabAttachInfo) {
    const tab = tabContainer.get(tabId)
    if (!tab) return

    const newWindow = windowContainer.get(info.newWindowId)
    tab.parentTo(newWindow.root)
    tab.renderIndentation()
  }

  // Tab moved to another window
  // Update container and reparent children
  static onTabDetached(tabId:number, _info:chrome.tabs.TabDetachInfo) {
    const tab = tabContainer.get(tabId)
    if (!tab) return

    tab.applyDescendants((child: Tab) => {
      console.log(child, tab)
      // Reparent direct children
      if (child.parent.id === tab.id) {
        child.parentTo(tab.parent)
      }
      // Re-render all descendants since their indentation has changed
      // while parent stayed the same.
      child.renderIndentation()
    })
  }

  // https://developer.chrome.com/docs/extensions/reference/tabs/#event-onUpdated
  static onTabUpdated(tabId:number, info:chrome.tabs.TabChangeInfo) {
    const tab = tabContainer.get(tabId)
    if (info.pinned && tab) {
      // Tab pinned -> parent children to tab's parent
      tab.children.applyAll((child: Tab) => {
        child.parentTo(tab.parent)
        child.renderIndentation()
      })
      tab.parentTo(tab.getWindow().root)

      // TODO: fix problems when an intended tab is pinned
    }
  }

  static onWindowCreated(chromeWindow:chrome.windows.Window) {
    const window = Window.init(chromeWindow)
    // Connect only when needed to avoid race conditions
    // (window is not ready to process messaging immediately after being created)
    // window.connect()
    windowContainer.add(window)
  }

  static onWindowRemoved(windowId:number) {
    const window = windowContainer.get(windowId)
    windowContainer.remove(window)
  }
}


// Initialize tab and window containers
chrome.windows.getAll(windowContainer.initFromArray.bind(windowContainer))
chrome.tabs.query({}, tabContainer.initFromArray.bind(tabContainer))

chrome.tabs.onCreated.addListener(ChromeCallbacks.onTabCreated)
chrome.tabs.onMoved.addListener(ChromeCallbacks.onTabMoved)
chrome.tabs.onRemoved.addListener(ChromeCallbacks.onTabRemoved)
chrome.tabs.onAttached.addListener(ChromeCallbacks.onTabAttached)
chrome.tabs.onDetached.addListener(ChromeCallbacks.onTabDetached)
chrome.tabs.onUpdated.addListener(ChromeCallbacks.onTabUpdated)
chrome.windows.onCreated.addListener(ChromeCallbacks.onWindowCreated)
chrome.windows.onRemoved.addListener(ChromeCallbacks.onWindowRemoved)
