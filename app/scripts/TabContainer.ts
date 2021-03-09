import Tab from './Tab'
import {TabCallback} from './Types/TabCallback'
import Container from './Container'

export class TabContainer extends Container {

  constructor() {
    super()
  }

  initialize() {
    chrome.tabs.query({}, this.initFromChromeQuery.bind(this))
  }

  // Create tabs and their relationships
  initFromChromeQuery(chromeQueryResponse: chrome.tabs.Tab[]) {
    const parentQueue = new Map<number, Array<Tab>>()

    chromeQueryResponse.forEach((chromeTab:chrome.tabs.Tab) => {
      const tab = new Tab(chromeTab)

      // Parent already in container -> set parent normally
      if (chromeTab.openerTabId) {

        const parent = this.tryGet(chromeTab.openerTabId)

        if (parent) {
          console.log(parent)
          tab.parentTo(parent)
        }

        // Parent not yet in container. Wait for it to be created
        else {
          if (!parentQueue.has(chromeTab.openerTabId)) {
            parentQueue.set(chromeTab.openerTabId, [])
          }
          // should be just parentQueue.get(tab.openerTabId).push(tabObj)
          const siblingparentQueue = parentQueue.get(chromeTab.openerTabId)

          if (siblingparentQueue) {
            siblingparentQueue.push(tab)
          }
        }
      }
      // Top level tab -> parent to window's root tab
      else {
        const window = tab.getWindow()
        if (window) {
          tab.parentTo(window.root)
        }
      }

      const queueForThis = parentQueue.get(tab.id)
      if (queueForThis) {
        // Children were created first -> parent them
        queueForThis.forEach((tab:Tab) => {
          tab.parentTo(tab)
        })
      }
      this.add(tab)
    })
  }
}

// Contains references to all tabs from each window
export const tabContainer = new TabContainer()
