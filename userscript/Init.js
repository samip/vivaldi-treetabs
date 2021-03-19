
// Initialize necessary objects and store them in window object
var tabCreated = (element, tabId) => {
  const tab = getTab(tabId)
  // tabIdState(tabId)
  // - displayCloseChildrenButton


  // Make sure button is shown after tab button is re-rendered
  if (tab.hasChildren) {
    // const cmdName = 'showCloseChildrenButton'
    // tab.commandIsQueued(cmdName) || tab.queueCommand(cmdName)
    // showCloseChildrenButton()
  }
  console.log('tab created tab#'+tabId, element, tab)
  // tab.setElement(element)
  // Commands were given to tab from extension before tab element
  // was rendered in UI, run them now.
  tab.runQueuedCommands(element)
  messaging.send({command: 'RenderAllTabs'})
  // tab.indentTab(1)
  // tab.reRenderObserver = window.treeTabs.uiObserver.onRerender(element, tabCreated)
}


function getTab (tabId) {
  if (!window.tabs[tabId]) {
    window.tabs[tabId] = new TabController(tabId)
    extLog('INFO', `New tab item (first command for) tab${tabId}`)
  } else {
    // extLog('INFO', `Existing tab item ${tabId}`)
  }
  if (!window.tabs[tabId].element) {
    window.tabs[tabId].setElement(window.tabs[tabId].findElement())
  }
  return window.tabs[tabId]
}

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


  uiObserver.init()
  // messaging.setUiController(uiController)

  window.treeTabs = {
    messaging: messaging,
    uiObserver: uiObserver,
    uiController: uiController,
    tabFunction: tabCreated
  }

  window.treeTabs.uiObserver.tab.addCallback('onCreated', (elemen, tabId) => {

    messaging.send({command: 'RenderAllTabs'})
  })

  console.log('Treetabs userscript initialized')
}

function uninitiliazeTreeTabUserScript() {
  delete window.treeTabs
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
  initTreeTabUserScript(port)
})
