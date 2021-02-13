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

  get(id:number): Window {
    const window = this.windows.get(id)
    if (!window) {
      // TODO: try to query missing window and put it into container.
      throw new Error('WindowContainer: access to missing element. id:  ' + id)
    }
    return window
  }

  remove(window:Window) {
    this.windows.delete(window.id)
  }

  initFromArray(windows:chrome.windows.Window[]) {
    windows.forEach((chromeWindow:chrome.windows.Window) => {
      const window = Window.init(chromeWindow)
      this.add(window)
    })
  }

}

export const windowContainer = new WindowContainer()
