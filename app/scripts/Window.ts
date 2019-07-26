import Node from './Node';

export default class Window {

  id: number;
  window: chrome.windows.Window;
  root: Node;

  constructor(window:chrome.windows.Window) {
    this.id = window.id;
    this.window = window;
    this.root = new Node();
  }

}