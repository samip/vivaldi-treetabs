
// Initialize necessary objects and store them in window object

function initTreeTabUserScript(messagingPort) {
  const uiController = new UIController()
  const messaging = new Messaging(messagingPort)
  const uiObserver = new UIObserver()

  uiObserver.tabContainer.addCallback('onCreated', (_element) => {
    // Tab container is removed when browser enters full screen mode
    // and is rendered again when exiting full screen mode.
    // Ask extension to re-render tab indentantions after
    // tab container is created
    messaging.send({command: 'RenderAllTabs'})
    uiController.showRefreshViewButton()
  })

  uiObserver.tab.addCallback('onCreated', (element, tabId) => {
    const tab = uiController.tab(tabId)
    // Make sure button is shown after tab button is re-rendered
    if (tab.hasChildren) {
      const cmdName = 'showCloseChildrenButton'
      tab.commandIsQueued(cmdName) || tab.queueCommand(cmdName)
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

  console.log('Treetabs userscript initialized')
}


class treeTabUserScriptError extends Error {
  constructor(message) {
    super(message)
    this.name = 'treeTabUserScriptError'
  }
}

// Send log to extension for easier viewing
function extLog() {
  if (window.treeTabs) {
    const argsArray = Array.from(arguments)
    window.treeTabs.messaging.log(argsArray)
  }
}

function portIsForWindow(port, win) {
  const windowId = win.vivaldiWindowId
  return port.name === 'window-' + windowId
}

chrome.runtime.onConnectExternal.addListener(port => {
  if (!portIsForWindow(port, window)) {
    return
  }

  console.info('INFO', `Messaging port '${port.name}' found it's window`)

  try {
    initTreeTabUserScript(port)
  } catch (error) {
    extLog(error)
    throw error
  }
})
