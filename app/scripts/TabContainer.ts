import Tab from './Tab'
import Container from './Container'

export class TabContainer extends Container {

  // Tabs mapped by id
  tabs: Map<number, Tab>

  constructor() {
    super()
  }

  initialize() {
    // chrome.tabs.getAll(this
  }

  initFromChromeQuery(chromeQueryResponse: any[]) {

  }

  // Create tabs and their relationships
  initFromArray(tabs:chrome.tabs.Tab[]) {
    const parentQueue = new Map<number, Array<Tab>>()

    tabs.forEach((tab:chrome.tabs.Tab) => {
      const tabObj = new Tab(tab)

      // Parent already in container -> set parent normally
      if (tab.openerTabId) {
        const parent = this.tryGet(tab.openerTabId)

        if (parent) {
          tabObj.parentTo(parent)
        }

        // Parent not yet in container. Wait for it to be created
        else {
          if (!parentQueue.has(tab.openerTabId)) {
            parentQueue.set(tab.openerTabId, [])
          }
          // should be just parentQueue.get(tab.openerTabId).push(tabObj)
          const siblingparentQueue = parentQueue.get(tab.openerTabId)

          if (siblingparentQueue) {
            siblingparentQueue.push(tabObj)
          }
        }
      }
      // Top level tab -> parent to window's root tab
      else {
        const window = tabObj.getWindow()
        tabObj.parentTo(window.root)
      }

      const queueForThis = parentQueue.get(tabObj.id)
      if (queueForThis) {
        // Children were created first -> parent them
        queueForThis.forEach((tab:Tab) => {
          tab.parentTo(tabObj)
        })
      }
      this.add(tabObj)
    })
  }

}

// Contains references to all tabs from each window
export const tabContainer = new TabContainer()
