import Window from './Window';

/*
Indexes windows by their ids
 */

class WindowContainer {

  windows: Map<number,Window>;

  constructor() {
    this.windows = new Map<number, Window>();
  }

  add(window:Window) {
    let key = window.id;
    this.windows.set(key, window);
  }

  get(id:number): Window {
    let window = this.windows.get(id);
    if (!window) {
      throw new Error('WindowContainer: access to missing element. id:  ' + id);
    }
    return window;
  }

  remove(window:Window) {
    this.windows.delete(window.id);
  }

  initFromArray(windows:chrome.windows.Window[]) {
    windows.forEach((window:chrome.windows.Window) => {
      let winObj = new Window(window);
      this.add(winObj);
    });
  }

}

export let windowContainer = new WindowContainer();
