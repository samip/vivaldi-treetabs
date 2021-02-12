import Tab from './Tab'

export default class Window {

  id: number
  window: chrome.windows.Window // https://developers.chrome.com/extensions/windows
  root: Tab

  constructor(window:chrome.windows.Window) {
    this.id = window.id
    this.window = window
    this.root = new Tab() // Every tab in window is descendant of this
  }

}
