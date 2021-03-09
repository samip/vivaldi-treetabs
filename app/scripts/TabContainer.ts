import Tab from './Tab'
import Container from './Container'

export class TabContainer extends Container {

  constructor() {
    super()
  }

  async initialize() {
    const queryInfo = {}
    chrome.tabs.query(queryInfo, this.initFromChromeQueryResponse.bind(this))
  }

  // Create tabs and their relationships
  initFromChromeQueryResponse(tabs:chrome.tabs.Tab[]) {
    tabs.forEach((chromeTab:chrome.tabs.Tab) => {
      // Tab could have been initialized with it's descendant
      if (!this.get(chromeTab.id!)) {
        const tab = Tab.InitFromChromeTab(chromeTab)
        this.add(tab)
      }
    })
  }

}

// Contains references to all tabs from each window
export const tabContainer = new TabContainer()
