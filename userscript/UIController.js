class UIController {

  constructor () {
    window.tabs = window.tabs || {}
    this.queue = []
    // TODO: inject
    // this.messagingFunction = window.treeTabs.messaging.send
    this.uid = Math.floor(Math.random() * 1000) + 1;
  }

  tab (tabId) {
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

  static deleteTabReference(tabId) {
    if (tabId) {
      delete window.tabs[tabId]
    }
  }

  commandIsQueued (command) {
    return this.queue.find(x => x.command === command) !== undefined
  }

  runQueuedCommands (_element) {
    while (this.queue.length) {
      // execute command and delete it from queue
      let cmd = this.queue.shift()
      this[cmd.command](cmd.args)
      extLog('INFO', `Queued command run ${cmd.command}`, cmd)
    }
  }

  queueCommand (command, args) {
    args = args || []
    const argsArray = Array.from(args)

    this.queue.push({
      command: command,
      args: argsArray
    })

    extLog('INFO', `Command added to queue:' ${command} args: ${argsArray.join(', ')}`)
    return this
  }

  showRefreshViewButton () {
    const buttonId = 'refresh-tab-tree'
    // Busted
    const existing = document.getElementById(buttonId)
    if (existing) {
      extLog('VERBOSE', 'Refresh button already rendered')
      return this
    }

    const target = document.querySelector('#tabs-container > .toolbar')
    const button = this.createRefreshViewButton()
    target.appendChild(button)
    extLog('VERBOSE', 'refreshButton rendered')
    return this
  }

  createRefreshViewButton () {
    const button = document.createElement('button')
    button.innerText = 'Refresh'
    button.id = 'refresh-tab-tree'
    button.classList = 'button-toolbar refresh-tab-tree'

    button.addEventListener('click', (_event) => {
      window.treeTabs.messaging.send({ command: 'RenderAllTabs' })
    })

    return button
  }
}
