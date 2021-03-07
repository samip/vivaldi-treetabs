class TabCommand {

  constructor (tabId, element) {
    this.tabId = tabId
    this.element = element
    this.queue = []
  }

  setElement (element) {
    this.element = element
    return this
  }

  runQueuedCommands (_element) {
    const queuedCommands = []

    while (this.queue.length) {
      let cmd = this.queue.shift()
      this[cmd.command](cmd.args)
      queuedCommands.push(cmd)
    }
    return queuedCommands
  }

  queueCommand (command, args) {
    window.messaging.log('queueCommand', command, args)
    const argsArray = []
    for (let i = 0; i < args.length; i++) {
      argsArray.push(args[i])
    }
    this.queue.push({
      command: command,
      args: argsArray
    })
    return this
  }

  // --------------
  // Tab UI methods
  // --------------

  indentTab (indentLevel) {
    if (!this.element) {
      return this.queueCommand('indentTab', arguments)
    }

    const indentVal = (indentLevel * this.indentationOption('step')) + this.indentationOption('unit')
    const indentAttribute = this.indentationOption('attribute')
    window.messaging.log('Indenting with values', indentAttribute, indentValue)
    if (this.element.parentElement) {
      // Setting tab elements parents's padding-left works well as of 14.2.2021
      this.element.parentElement.style[indentAttribute] = indentVal
    }
  }

  indentationOption (key) {
    const options = {
      step: 15,
      unit: 'px',
      attribute: 'paddingLeft'
    }
    return options[key]
  }

  showCloseChildrenButton () {
    if (!this.element) {
      return this.queueCommand('showCloseChildrenButton', arguments)
    }

    const closeButton = this.element.querySelector('.close')
    const buttonClass = 'close-children'
    const existingButton = this.element.querySelector('.' + buttonClass)

    if (existingButton) {
      existingButton.style.visibility = 'initial'
      return this
    }

    const closeChildrenButton = this.closeChildrenButton()
    closeChildrenButton.title = 'Close child tabs'
    closeChildrenButton.classList.add('close')
    closeChildrenButton.classList.add(buttonClass)
    closeChildrenButton.innerHTML = TabCommand.getCloseChildrenButtonSVG()

    closeChildrenButton.addEventListener('click', (_event) => {
      window.messaging.send({command: 'CloseChildren', tabId: this.tabId})
    })
    closeButton.parentNode.insertBefore(closeChildrenButton, closeButton)
    return this
  }

  hideCloseChildrenButton () {
    if (!this.element) {
      return this.queueCommand('hideCloseChildrenButton', arguments)
    }
    const buttonClass = 'close-children'
    const closeChildrenButton = this.element.querySelector('.' + buttonClass)
    if (closeChildrenButton) {
      closeChildrenButton.style.visibility = 'hidden'
    }
    return this
  }

  childrenButtonElement () {
    const element = document.createElement('button')
    element.title = 'Close child tabs'
    element.classList.add('close')
    element.classList.add(buttonClass)
    element.innerHTML = TabCommand.getCloseChildrenButtonSVG()

    element.addEventListener('click', (_event) => {
      window.messaging.send({command: 'CloseChildren', tabId: this.tabId})
    })

    return element
  }

  // icon for close children button. Vivaldi's close tab icon + three circles
  static getCloseChildrenButtonSVG () {
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

}

