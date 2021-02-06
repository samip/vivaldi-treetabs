/*
Control browser ui from extension.

Called from vivaldi-tabs extension to set tab indentation.

See Command class for available commands
*/

console.log('Browserhook loaded')

class CommandQueue {

  constructor() {
    this.queue = new Map()
    this.tabObserver = this.getTabObserver()
  }

  getTabObserver() {
    var queue = this.queue
    var handle = this.handleCommand

    const observer = new MutationObserver(function(mutations) {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            const tab = node.querySelector('.tab')
            const tab_id = tab.id.split('-')[1]
            const requestForTab = queue[tab_id]
            if (requestForTab) {
              let entry
              while (entry = requestForTab.shift()) {
                console.log('.-', entry)
                handle(entry.command, entry.sendResponse)
              }
            }
          })
        }
      })
    })

    const tabStrip = document.getElementsByClassName('tab-strip')[0]
    if (!tabStrip) {
      setTimeout(() => {
            this.getTabObserver()
          }, 50)
      return
    }

    observer.observe(tabStrip, {
      attributes: false,
      childList: true,
      characterData: false
    })

    return observer
  }



  add(command, sendResponse) {
    if (command.tabId) {
      if (!this.queue[command.tabId]) {
        this.queue[command.tabId] = []
      }

      let element = new TabControl().getElement(command.tabId)

      if (element) {
        this.handleCommand(command, sendResponse)
      } else {
        this.queue[command.tabId].push({ command: command, sendResponse: sendResponse })
      }
    } else {
      this.handleCommand(command, sendResponse)
    }
  }


  handleCommand(request, sendResponse) {
    const tabcontrol = new TabControl()
    if (!request) {
      console.error('no command in handleCommand')
      return
    }
    tabcontrol.showRefreshViewButton()
    switch (request.command) {

      /*
      Indents tab

      @param tabId
      @param indentLevel - how many steps tab needs to be indented. One step is by default 20 px
       */
      case 'IndentTab':
        if (typeof request.tabId === 'undefined' || typeof request.indentLevel === 'undefined') {
          console.log('Undefined tabId or indentLevel')
        } else {
          tabcontrol.IndentTab(request.tabId, request.indentLevel)
        }
        break

      /*
       * Show tab's id next to it's title. Used in debugging only.
       *
       * @param tabId
       */
      case 'ShowId':
        if (request.tabId) {
          tabcontrol.ShowId(request.tabId, request.indentLevel)
        }
        break

      /* Append attribute to tab strip. Used in debugging only.
       *
       */
      case 'appendAttribute':
        // UNSAFE
        tabcontrol.appendAttribute(request.tabId, request.attribute, request.value)
        break

      /* Show or create 'Close child tabs' button in tab strip
       * @param TabId
       */
      case 'showCloseChildrenButton':
        tabcontrol.showCloseChildrenButton(request.tabId)
        break

      /* Hide 'Close child tabs' button in tab strip
       * @param TabId
       */
      case 'hideCloseChildrenButton':
        tabcontrol.hideCloseChildrenButton(request.tabId)
        break

      default:
        console.log('Invalid command')
        return sendResponse('Invalid command: ' + request.command)
    }

    if (typeof sendResponse === 'function') {
      sendResponse(request.command + ' executed')
    }
  }

}


class TabControl {

  constructor () {
    this.indentStep = 20
    this.indentUnit = 'px'
    this.indentAttribute = 'marginLeft'
  }

  IndentTab (tabId, indentLevel, pass) {
    const element = this.getElement(tabId)
    const indentVal = (indentLevel * this.indentStep) + this.indentUnit
    element.style[this.indentAttribute] = indentVal
  }

  SetIndentStyle () {
    console.log('SetIndentStyle not implemented')
  }

  appendAttribute (tabId, attribute, value) {
    const element = this.getElement(tabId)
    const oldValue = element.getAttribute(attribute)
    element.setAttribute(attribute, oldValue + '' + value)
  }

  setAttribute (tabId, attribute, value) {
    const element = this.getElement(tabId)
    element.setAttribute(attribute, value)
  }

  ShowId (tabId) {
    this.SetText(tabId, tabId)
  }

  SetText (tabId, text) {0
    const element = this.getElement(tabId)

    if (!element) {
      console.log('Missing element for tabId' + tabId)
      return
    }
    const oldTitle = element.querySelector('.title')
    const oldCustom = oldTitle.querySelector('.custom-title')

    if (oldCustom) {
      oldCustom.innerText = text
    } else {
      oldTitle.innerHTML = '<span class="custom-title">' + text + '</span>' + oldTitle.innerHTML
    }
  }

  showCollapseChildrenButton (tabId) {
    /*
     * This is next to impossible to implement since tabs have relative top coordinates calculated by Vivaldi.
     */
  }

  showRefreshViewButton () {
    const buttonId = 'refresh-tab-tree'
    const existing = document.getElementById(buttonId)
    if (existing) {
      return
    }

    const target = document.querySelector('#tabs-container > .toolbar')
    const button = document.createElement('button')

    button.innerText = 'Refresh'
    button.id = 'refresh-tab-tree'
    button.classList = 'button-toolbar refresh-tab-tree'

    button.addEventListener('click', (event) => {
      messaging.send({ command: 'RefreshTabTree' })
    })

    target.appendChild(button)
  }

  showCloseChildrenButton (tabId) {
    const element = this.getElement(tabId)
    const buttonClass = TabControl.getCloseChildrenButtonClassname()
    const closeButton = element.querySelector('.close')
    const alreadyCreated = closeButton.previousSibling.classList.contains(buttonClass)
    const existingButton = element.querySelector('.' + buttonClass)

    if (existingButton) {
      existingButton.style.visibility = 'initial'
    } else {
      let closeChildrenButton = document.createElement('button')
      closeChildrenButton.title = 'Close child tabs'
      closeChildrenButton.classList.add('close')
      closeChildrenButton.classList.add(buttonClass)
      closeChildrenButton.innerHTML = TabControl.getCloseChildrenButtonSVG()

      closeChildrenButton.addEventListener('click', (event) => {
        messaging.send({ command: 'CloseChildren', tabId: tabId  })
      })
      closeButton.parentNode.insertBefore(closeChildrenButton, closeButton) // insert closeChildrenButton before the real close button
    }
  }

  hideCloseChildrenButton (tabId) {
    const element = this.getElement(tabId)
    const buttonClass = TabControl.getCloseChildrenButtonClassname()
    const button = element.querySelector('.' + buttonClass)

    if (button) {
      button.style.visibility = 'hidden'
    }
  }

  static getCloseChildrenButtonClassname() {
    return 'close-children'
  }

  /// icon for close children button. Vivaldi's close tab icon + three circles
  static getCloseChildrenButtonSVG() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
            <path d="M13.5 6l-1.4-1.4-3.1 3-3.1-3L4.5 6l3.1 3.1-3 2.9 1.5 1.4L9 10.5l2.9 2.9 1.5-1.4-3-2.9"></path>
            <circle
             cx="5.5"
             cy="15.8"
             r="1.5" />
            <circle
             cx="9"
             cy="15.8"
             r="1.5" />
            <circle
             cx="12.394068"
             cy="15.8"
             r="1.5" />
          </svg>`
  }

  getElement (tabId) {
    return document.getElementById('tab-' + tabId)
  }

}


class Messaging {

  constructor() {
    this.port = null
  }

  init() {
    chrome.runtime.onConnectExternal.addListener(messaging.onConnected.bind(messaging))
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError)
    }
  }

  onConnected(port) {
    this.port = port
    this.port.onMessage.addListener(this.onReceived)
    console.log('Connected to browserhook', port)
  }

  onReceived(request) {
    console.log('onReceived', request)
    var send = this.send
    const sendResponse = (response) => { console.log('Dummy sendResponse', response) }
    cmdQueue.add(request, sendResponse)
    console.log('Request queued', request)
  }

  send(msg) {
    if (this.port) {
      console.log('sending msg', msg)
      this.port.postMessage(msg)
      if (chrome.runtime.lastError) {
        console.log('caught')
        console.log(chrome.runtime.lastError)
      }
    } else {
      throw new Error('Connection not established')
    }
  }
}

let cmdQueue = new CommandQueue()
let messaging = new Messaging()
messaging.init()
