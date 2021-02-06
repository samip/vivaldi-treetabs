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

    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError)
    }
    console.log('Connected to browserhook', port)
  }

  /*
    Handle incoming command
  */
  onReceived(request) {
    const tabcontrol = new TabControl()

    switch (request.command) {
      /*
        Indents tab by <indentLevel> steps.
        @param tabId
        @param indentLevel - how many steps tab needs to be indentedx
       */
      case 'IndentTab':
        // tabcontrol.IndentTab(request.tabid, request.indentLevel)
        break

      /*
       * Show tab's id next to it's title. Used in debugging only.
       *
       * @param tabId
       */
      case 'ShowId':
        tabcontrol.ShowId(request.tabId, request.indentLevel)
        break

      /* Append attribute to tab strip. Used in debugging only.
       */
      case 'appendAttribute':
        // UNSAFE
        tabcontrol.appendAttribute(request.tabId,
          request.attribute,
          request.value)
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
        console.error('Invalid command')
        // invalid command
        break
    }
  }

  send(msg) {
    if (!this.port) {
      console.error('No connection')
      return
    }

    console.log('sending msg', msg)
    // this.port.postMessage(msg)
    if (chrome.runtime.lastError) {
      log('Caught', LogType.info)
      console.log(chrome.runtime.lastError)
    }
  }
}





console.log('Browserhook loaded')
const messaging = new Messaging()
const vivaldiUI = new VivaldiUIObserver()
vivaldiUI.tabContainer.addCallback('onCreated', (element) => messaging.send({command: 'refreshTree' }))

vivaldiUI.tab.addCallback('onCreated', (element, tabId) => {

  messaging.send( { command: 'indentTab', tabId: tabId })
})

messaging.init()
vivaldiUI.init()
