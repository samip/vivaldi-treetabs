class UIController {

  constructor () {
    this.tabs = {}
    this.queue = []
    this.messagingFunction = null
  }

  tab (tabId) {
    if (!this.tabs[tabId]) {
      this.tabs[tabId] = new TabController(tabId)
      this.tabs[tabId].setMessagingFunction(this.messagingFunction)
      extLog('INFO', `New tab item (first command for) tab${tabId}`)
    } else {
      extLog('INFO', `Existing tab item ${tabId}`)
    }
    if (!this.tabs[tabId].element) {
      this.tabs[tabId].setElement(this.tabs[tabId].findElement())
    }
    return this.tabs[tabId]
  }


  setMessagingFunction (fn) {
    this.messagingFunction = fn
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

    extLog('INFO', `Command added to queue:' ${command} args: ${args.join(', ')}`)
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
      this.messagingFunction({ command: 'RenderAllTabs' })
    })

    return button
  }
}
