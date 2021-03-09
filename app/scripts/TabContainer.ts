import Tab from './Tab'
import {TabCallback} from './Types/TabCallback'

export class TabContainer {

  // Tabs mapped by id
  tabs: Map<number, Tab>

  constructor() {
    this.tabs = new Map<number, Tab>()
  }

  add(tab:Tab): void {
    this.tabs.set(tab.id, tab)
  }

  get(id:number): Tab {
    const tab = this.tabs.get(id)
    if (!tab) {
      throw new Error(`Invalid access for tab id ${id}`)
    }
    return tab
  }

  tryGet(id:number): Tab | undefined {
    return this.tabs.get(id)
  }

  applyAll(callback: TabCallback): void {
    this.tabs.forEach((tab:Tab) => callback(tab))
  }

  getFirst(): Tab {
    return this.tabs.values().next().value
  }

  remove(tab:Tab) {
    if (this.tabs.get(tab.id)) {
      this.tabs.delete(tab.id)
    }
  }

  isEmpty(): boolean {
    return this.tabs.size === 0
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
