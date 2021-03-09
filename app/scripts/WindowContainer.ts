import Window from './Window'
import Container from './Container'

class WindowContainer extends Container {

  constructor() {
    super()
  }

  initialize() {
    chrome.windows.getAll(this.initFromChromeQuery.bind(this))
  }

  initFromChromeQuery(chromeQueryResponse: chrome.windows.Window[]) {
    chromeQueryResponse.forEach((chromeWindow:chrome.windows.Window) => {
      const window = Window.init(chromeWindow)
      this.add(window)
    })
  }

}

export const windowContainer = new WindowContainer()
