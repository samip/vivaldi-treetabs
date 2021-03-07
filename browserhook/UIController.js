class UIController {

  constructor () {
    this.tabs = {}
    this.queue = []
    this.messagingFunction = null
  }

  tab (tabId) {
    if (this.tabs[tabId]) {
      this.tabs[tabId].setElement(this.getElement(tabId))
    } else {
      this.tabs[tabId] = new TabController(tabId, this.getElement(tabId))
      this.tabs[tabId].setMessagingFunction(this.messagingFunction)
    }
    return this.tabs[tabId]
  }

  setElement (element) {
    this.element = element
    return this
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
    }
  }

  queueCommand (command, args) {
    args = args || []

    const argsArray = []
    for (let i = 0; i < args.length; i++) {
      argsArray.push(args[i])
    }

    this.queue.push({
      command: command,
      args: argsArray
    })

    extLog('INFO', 'Command added to queue:' + command)
    return this
  }

  showRefreshViewButton () {
    const buttonId = 'refresh-tab-tree'
    // Busted
    const existing = document.getElementById(buttonId)
    if (existing) {
      extLog('DEBUG', 'Skipping show refresh view button.. button already rendered')
      return this
    }

    const target = document.querySelector('#tabs-container > .toolbar')
    const button = this.createRefreshViewButton()
    target.appendChild(button)
    extLog('refreshButton rendered')
    return this
  }

  createRefreshViewButton() {
    const button = document.createElement('button')
    button.innerText = 'Refresh'
    button.id = 'refresh-tab-tree'
    button.classList = 'button-toolbar refresh-tab-tree'

    button.addEventListener('click', (_event) => {
      // !!!
      console.log(this, this.messagingFunction)
      window.treeTabs.messaging.send({ command: 'RenderAllTabs' })
    })

    return button
  }

  getElement (tabId) {
    return document.getElementById('tab-' + tabId)
  }
}
