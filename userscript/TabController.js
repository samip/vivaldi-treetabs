class TabController extends UIController {
  constructor (tabId, element) {
    super()
    this.tabId = tabId
    this.element = element
    this.hasChildren = false
  }

  // --------------
  // Tab UI methods
  // --------------

  indentTab (indentLevel) {
    if (!this.element) {
      return this.queueCommand('indentTab', arguments)
    }

    const indentValue = this.indentationCSSValue(indentLevel)
    const indentAttribute = this.indentationOption('attribute')

    // extLog('DEBUG', 'Indenting #' + this.tabId +' with attribute/value',
      // indentAttribute, indentValue)

    this.element.parentElement.style[indentAttribute] = indentValue
    return this
  }

  indentationOption (key) {
    const options = {
      step: 15,
      unit: 'px',
      attribute: 'paddingLeft'
    }
    return options[key]
  }

  closeAllChildrenButtonClass () {
    return 'close-children'
  }

  indentationCSSValue (indentLevel) {
    return indentLevel * this.indentationOption('step') +
      this.indentationOption('unit')
  }

  showCloseChildrenButton () {
    this.hasChildren = true
    if (!this.element) {
      return this.queueCommand('showCloseChildrenButton', arguments)
    }

    const closeButton = this.element.querySelector('.close')
    const buttonClass = this.closeAllChildrenButtonClass()
    const existingButton = this.element.querySelector('.' + buttonClass)

    if (existingButton) {
      existingButton.style.visibility = 'initial'
      extLog('DEBUG', 'Setting an existing CloseChildrenButton visible')
    } else {
      const closeChildrenButton = this.createCloseChildrenButton()
      closeButton.parentNode.insertBefore(closeChildrenButton, closeButton)
      extLog('DEBUG', 'CloseChildrenButton created for element')
    }

    extLog('DEBUG', `Showing close children button for tab#${this.tabId}`)
    return this
  }

  hideCloseChildrenButton () {
    this.hasChildren = false
    if (!this.element) {
      return this.queueCommand('hideCloseChildrenButton', arguments)
    }

    const buttonClass = this.closeAllChildrenButtonClass()
    const button = this.element.querySelector('.' + buttonClass)
    if (button) {
      button.style.visibility = 'hidden'
    }

    extLog('DEBUG', 'Hiding close children button')
    return this
  }

  createCloseChildrenButton () {
    const element = document.createElement('button')
    const buttonClass = this.closeAllChildrenButtonClass()

    element.title = 'Close child tabs'
    element.classList.add('close')
    element.classList.add(buttonClass)
    element.innerHTML = TabController.closeChildrenButtonSVG()

    element.addEventListener('click', (_event) => {
      this.messagingFunction({
        command: 'CloseChildren',
        tabId: this.tabId
      })
    })

    return element
  }

  // icon for close children button. Vivaldi's close tab icon + three circles
  static closeChildrenButtonSVG () {
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
