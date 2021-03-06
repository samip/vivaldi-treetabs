import {TabContainer, tabContainer} from './TabContainer'
import Command from './Command'
import Window from './Window'
import {windowContainer} from './WindowContainer'
import {TabCallback} from './Types/TabCallback'

export default class Tab {

  id: number

  // https://developer.chrome.com/extensions/tabs
  chromeTab: chrome.tabs.Tab
  children: TabContainer
  parent: Tab
  initialIndex: number
  isRoot: boolean

  constructor(chromeTab?: chrome.tabs.Tab) {
    if (chromeTab) {
      if (chromeTab.id) {
        this.id = chromeTab.id
      } else {
        // "Under some circumstances a tab may not be assigned an ID for example,
        // when querying foreign tabs using the sessions API"
        // should never happen here
        throw new Error('No tab id')
      }
      this.chromeTab = chromeTab
      this.initialIndex = chromeTab.index
    } else {
      this.isRoot = true
      this.id = 0
    }
    this.children = new TabContainer()
  }

  static InitFromChromeTab(chromeTab: chrome.tabs.Tab): Tab {
    const tab = new Tab(chromeTab)
    const openerTabId = chromeTab.openerTabId

    let parentNode
    if (openerTabId) {
      parentNode = tabContainer.getOrCreate(openerTabId, Tab.InitFromChromeTab)
    } else {
      parentNode = tab.getWindow().root
    }

    tab.parentTo(parentNode)
    return tab
  }

  // Call function on every child (but not children of children)
  applyChildren(callback: TabCallback): void {
    this.children.applyAll(callback)
  }

  // Call function on every descendant (children, children of children
  applyDescendants(callback: TabCallback): void {
    this.children.applyAll((tab: Tab) => {
      callback(tab)
      return tab.applyDescendants(callback)
    })
  }

  // Send tab specific command to userscript
  command(command: string, parameters: any = {}): void {
    parameters['tabId'] = this.id
    const cmd = new Command(command, parameters)
    cmd.send(this.getWindow())
  }

  // Traverse to root, return distance / depth / indentlevel  **/
  /* eg:
    -a: root
       - b: distance to root: 1
       - c: distance to root: 1
         - d: distance to root: 2
  */
  calculateDistanceToRoot(): number {
    let helper = function (tab: Tab, distance: number): any {
      if (tab.parent) {
        if (tab.parent.isRoot) {
          return helper(tab.parent, distance)
        } else {
          return helper(tab.parent, ++distance)
        }
      } else {
        return distance
      }
    }
    return helper(this, 0)
  }

  depth(): number {
    return this.calculateDistanceToRoot()
  }

  getWindow(): Window {
    const windowId = this.chromeTab.windowId
    const _window = windowContainer.get(windowId)
    if (!_window) {
      throw Error('No window for tab')
    }
    return _window!
  }

  parentTo(parent: Tab): Tab {
    parent.children.add(this)
    this.parent = parent
    // Has children now -> show close children button
    // if (!parent.isRoot && !parent.closeChildrenButtonVisible) {
    if (!parent.isRoot) {
      parent.showCloseChildrenButton()
    }
    return this
  }

  // Remove tab and parent it's children to own parent
  remove(): void {
    // Parent removed tab's children to own parent and redraw
    this.applyDescendants((child: Tab) => {
      // Reparent direct children
      if (child.parent.id === this.id) {
        child.parentTo(this.parent)
      }
      // Re-render all descendants since their indentation has changed,      // while parent stayed the same.
      child.renderIndentation()
    })

    this.parent.children.remove(this) // remove from parent's children

    // The last child was removed -> hide close children button
    if (!this.parent.isRoot && this.parent.children.isEmpty()) {
      this.parent.hideCloseChildrenButton()
    }
    this.flushData()
  }

  // Tab commands, todo: move to own file
  removeChildren(): void {
    this.applyDescendants((child: Tab) => {
      chrome.tabs.remove(child.id)
      if (chrome.runtime.lastError) {
        console.log('Error on removeChildren')
      }
    })
  }

  flushData(): void {
    this.command('FlushData')
  }

  showCloseChildrenButton(): void {
    // Tab strips are re-rendered sometimes on current Vivaldi snapshopt
    // and our buttons are lost in process.
    // Fix by rendering all close buttons for window each time

    const root = this.getWindow().root
    root.applyDescendants((tab: any) => tab.renderEverything())

    this.renderCloseChildrenButton()
  }

  // Called on each tab after tab container reappear is redrawn.
  renderEverything(): void {
    this.renderCloseChildrenButton()
    this.renderIndentation()
  }

  renderIndentation(): void {
    const depth = this.depth()
    this.command('IndentTab', { indentLevel: depth})
  }

  renderCloseChildrenButton(): void {
    if (!this.children.isEmpty()) {
      this.command('ShowCloseChildrenButton')
    }
  }

  hideCloseChildrenButton(): void {
    this.command('HideCloseChildrenButton')
    const root = this.getWindow().root
    root.applyDescendants((tab: any) => tab.renderEverything())
  }

}
