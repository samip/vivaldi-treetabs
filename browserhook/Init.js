function initTreeTabUserScript(messagingPort) {
  const uiController = new UIController()
  const messaging = new Messaging(messagingPort)
  const uiObserver = new UIObserver()

  uiObserver.tabContainer.addCallback('onCreated', (_element) => {
    // Tab container is removed when browser enters full screen mode
    // and is rendered again when exiting full screen mode.
    // Ask extension to re-render tab indentantions after Tab container is created.
    messaging.send({command: 'RenderAllTabs'})
    uiController.showRefreshViewButton()
  })

  uiObserver.tab.addCallback('onCreated', (element, tabId) => {
    const tab = uiController.tab(tabId)
    // Make sure button is shown after tab button is re-rendered
    if (tab.hasChildren) {
      tab.commandIsQueued(cmdName) || this.queueCommand(cmdName)
    }
    uiController.tab(tabId).setElement(element)
    // Commands were given to tab from extension before tab element
    // was rendered in UI, run them now.
    uiController.tab(tabId).runQueuedCommands(element)
  })

  uiObserver.init()
  uiController.setMessagingFunction(messaging.send.bind(messaging))
  messaging.setUiController(uiController)

  window.treeTabs = {
    messaging: messaging,
    uiObserver: uiObserver,
    uiController: uiController
  }

  console.log('https://github.com/samip/vivaldi-treetabs user script initialized')
}


class treeTabUserScriptError extends Error {
  constructor(message) {
    super(message)
    this.name = 'treeTabUserScriptError'
  }
}

function extLog() {
  if (window.treeTabs) {
    window.treeTabs.messaging.log(arguments)
  }
}

chrome.runtime.onConnectExternal.addListener(port => {
  const windowId = window.vivaldiWindowId
  const isForCurrentWindow = port.name === 'window-' + windowId

  if (isForCurrentWindow) {
    console.info('Messaging port for window', port.name)
    try {
      initTreeTabUserScript(port)
    } catch (error) {
      extLog(error)
      throw error
    }
  }
})
