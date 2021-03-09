import Window from './Window'
import Container from './Container'

class WindowContainer extends Container {

  windows: Map<number,Window> // Windows indexed by ids

  constructor() {
    super()
    this.windows = new Map<number, Window>()
  }

  initialize() {
    // chrome.windows.getAll(this.initFromChromeQuery.bind(this))
  }

  initFromChromeQuery(chromeQueryResponse: any[]) {

  }

  initFromArray(windows:chrome.windows.Window[]) {
    windows.forEach((chromeWindow:chrome.windows.Window) => {
      // connect() doesn't work here due to a race-condition with messaging.
      // Try connecting when the message-bridge is actually needed; Command#send()
      // TODO: connect from userscript instead
      const window = Window.init(chromeWindow)
      this.add(window)
    })
  }

}

export const windowContainer = new WindowContainer()
