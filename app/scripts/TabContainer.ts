import Tab from './Tab'

// c/p from Node.ts
// TODO: fix duplicate definition
export type NodeCallback = (node: Tab) => any

export class TabContainer {

  // Tabs mapped by id
  tabs: Map<number, Tab>

  constructor() {
    this.tabs = new Map<number, Tab>()
  }

  add(node:Tab): void {
    this.tabs.set(node.id, node)
  }

  get(id:number): Tab {
    const node = this.tabs.get(id)
    if (!node) {
      throw new Error('Invalid access for node id' + id)
    }
    return node
  }

  applyAll(callback: NodeCallback): void {
    this.tabs.forEach((node:Tab) => {
      callback(node)
    })
  }

  getFirst(): Tab {
    return this.tabs.values().next().value
  }

  remove(node:Tab) {
    if (this.tabs.get(node.id)) {
      this.tabs.delete(node.id)
    }
  }

  isEmpty(): boolean {
    return this.tabs.size === 0
  }

  // Create nodes and their relationships
  initFromArray(tabs:chrome.tabs.Tab[]) {
    const parentQueue = new Map<number, Array<Tab>>()

    tabs.forEach((tab:chrome.tabs.Tab) => {
      const tabObj = new Tab(tab)

      // Parent already in container -> set parent normally
      if (tab.openerTabId) {
        const parent = this.get(tab.openerTabId)

        if (parent) {
          tabObj.parentTo(parent)
        }

        // parent not yet in container. Wait for it to be created
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
      // Top level tab -> parent to window's root node
      else {
        const window = tabObj.getWindow()
        tabObj.parentTo(window.root)
      }

      const queueForThis = parentQueue.get(tabObj.id)
      if (queueForThis) {
        // Children were created first -> parent them
        queueForThis.forEach((node:Tab) => {
          node.parentTo(tabObj)
        })
      }
      this.add(tabObj)
    })
  }
}

// Contains tabs from each window
export const tabContainer = new TabContainer()
