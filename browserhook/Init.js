function initTreeTabUserScript(messagingPort) {
  console.log('https://github.com/samip/vivaldi-treetabs user script initialized')
  const uiController = new UIController()
  const messaging = new Messaging(messagingPort, window.uiControl)
  const uiObserver = new UIObserver()

  uiObserver.tabContainer.addCallback('onCreated', (_element) => {
    // Tab container is removed when browser enters full screen mode
    // and is rendered again when exiting full screen mode.
    // Ask extension to re-render tab indentantions after Tab container is created.
    messaging.send({command: 'RenderAllTabs'})
    // uiController.showRefreshViewButton()
  })

  uiObserver.tab.addCallback('onCreated', (element, tabId) => {
    // Commands were given to tab from extension before tab element
    // was rendered in UI, run them now.
    uiController.tab(tabId).setElement(element)
    uiController.tab(tabId).runQueuedCommands(element)
  })

  uiObserver.init()

  window.treeTabs = {
    messaging: messaging,
    uiObserver: uiObserver,
    uiController: uiController
  }
}

class treeTabUserScriptError extends Error {
  constructor(message) {
    super(message)
    this.name = 'treeTabUserScriptError'
  }
}

function extLog() {
  window.treeTabs.messaging.log(arguments)
}


chrome.runtime.onConnectExternal.addListener(port => {
  const windowId = window.vivaldiWindowId
  const portIsForCurrentWindow = port.name === 'window-' + windowId

  if (portIsForCurrentWindow) {
    console.info('Messaging port for new window', port.name)
    try {
      initTreeTabUserScript(port)
    } catch (e) {
      extLog(e.message)
    }
  }
})
