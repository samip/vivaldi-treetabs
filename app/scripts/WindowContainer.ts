import Window from './Window'

class WindowContainer {

  windows: Map<number,Window> // Windows indexed by ids

  constructor() {
    this.windows = new Map<number, Window>()
  }

  add(window:Window) {
    const key = window.id
    this.windows.set(key, window)
  }

  get(id:number): Window | undefined {
    return this.windows.get(id)
  }

  remove(window:Window) {
    this.windows.delete(window.id)
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
