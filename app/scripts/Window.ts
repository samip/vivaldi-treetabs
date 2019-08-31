import Node from './Node';

export default class Window {

  id: number;
  window: chrome.windows.Window; // https://developers.chrome.com/extensions/windows
  root: Node;

  constructor(window:chrome.windows.Window) {
    this.id = window.id;
    this.window = window;
    this.root = new Node(); // Every tab in window is descendant of this
  }

}
