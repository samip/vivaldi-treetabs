import Window from './Window'
import Container from './Container'

class WindowContainer extends Container {

  constructor() {
    super()
  }

  async initialize() {
    chrome.windows.getAll(this.initFromChromeQueryResponse.bind(this))
  }

  initFromChromeQueryResponse(windows:chrome.windows.Window[]) {
    windows.forEach((chromeWindow:chrome.windows.Window) => {
      // connect() doesn't work here due to a race-condition with messaging.
      // Try connecting when the message-bridge is actually needed; Command#send()
      // TODO: connect from userscript instead
      const window = Window.initFromChromeWindow(chromeWindow)
      this.add(window)
    })
  }

}

export const windowContainer = new WindowContainer()
