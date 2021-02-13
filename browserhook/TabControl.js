class TabControl {
  constructor () {
    this.indentStep = 15
    this.indentUnit = 'px'
    this.indentAttribute = 'paddingLeft'
    this.commandQueue = {}
  }

  // todo: take element as parameter
  IndentTab (tabId, indentLevel) {
    const element = this.getElement(tabId)
    if (!element) {
      console.log('No element')
      return this.queueTabCommand(tabId, arguments)
    }

    const indentVal = (indentLevel * this.indentStep) + this.indentUnit
    if (element.parentElement && element.parentElement.classList.contains('tab-position')) {
      element.parentElement.style[this.indentAttribute] = indentVal
    } else {
      // Probably broken by Vivaldi update
      console.error('Broken by update')
      console.error(element.parentElement)
    }

  }

  queueTabCommand(tabId, argumentsObject) {
    this.commandQueue[tabId] = this.commandQueue[tabId] || []
    this.commandQueue[tabId].push(argumentsObject)
    console.log('Command queued', tabId, argumentsObject)
  }

  runQueuedTabCommands(tabId, element) {
    const commandsRun = []
    if (!this.commandQueue[tabId]) {
      return commandsRun
    }

    while (this.commandQueue[tabId].length) {
      let command = this.commandQueue[tabId].shift()
      // TODO: generic command queue
      this.IndentTab(tabId, command[1])
      commandsRun.push(command)
    }
    return commandsRun
  }

  setAttribute (tabId, attribute, value) {
    const element = this.getElement(tabId)
    element.setAttribute(attribute, value)
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

    button.addEventListener('click', (_event) => {
      messaging.send({ command: 'RenderAllTabs' })
    })

    target.appendChild(button)
  }

  showCloseChildrenButton (tabId) {
    const element = this.getElement(tabId)
    const buttonClass = TabControl.getCloseChildrenButtonClassname()
    // TODO: can crash
    const closeButton = element.querySelector('.close')
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
      closeButton.parentNode.insertBefore(closeChildrenButton, closeButton) // insert closeChildrenButton before the 'close tab' button
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

  // The dom element for tab button
  getElement (tabId) {
    return document.getElementById('tab-' + tabId)
  }
}
