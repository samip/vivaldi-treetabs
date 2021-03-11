class TabController extends UIController {

  constructor (tabId) {
    super()
    this.tabId = tabId
    this.hasChildren = false
  }

  // --------------
  // Tab UI methods
  // --------------

  indentTab (indentLevel) {
    const element = this.findElement()
    if (!element) {
      return this.queueCommand('indentTab', arguments)
    }

    if (!element.parentElement) {
      extLog('INFO', 'indentTab attempt on element without parentElement on tab#' + this.tabId)
      return this
    }

    const colorScheme = ["505050","58534F","61564F","69594E",
      "725B4E","7A5E4D","83614D","8B644C","93674B","9C6A4B",
      "A46C4A","AD6F4A","B57249"]


    const indentValue = this.indentationCSSValue(indentLevel)
    const indentAttribute = this.indentationOption('attribute')
    const classPrefix = 'treetabs-level-'

    element.parentElement.style[indentAttribute] = indentValue
    element.parentElement.style['backgroundColor'] = '#' + colorScheme[indentLevel]

    element.classList.each(klass => {
      if (klass.startsWith(classPrefix)) {
        element.classList.remove(klass)
      }
    })
    element.classList.add(classPRefix + indentLevel)

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

  indentationCSSValue (indentLevel) {
    return indentLevel * this.indentationOption('step') +
      this.indentationOption('unit')
  }


  showCloseChildrenButton () {
    this.hasChildren = true
    const element = this.findElement()
    if (!element) {
      return this.queueCommand('showCloseChildrenButton', arguments)
    }

    // Append next to regular  
    const closeButton = element.querySelector('.close')
    const buttonClass = this.closeAllChildrenButtonClass()
    const existingButton = element.querySelector('.' + buttonClass)

    if (existingButton) {
      existingButton.style.visibility = 'initial'
      extLog('DEBUG', `CloseChildrenButton set visible for tab#${this.logDisplay(this)}`)
      console.log('closeButton updated', existingButton, element)
      // extLog('DEBUG', Showing close children button for tab#${this.logDisplay()}`)
    } else {
      const closeChildrenButton = this.createCloseChildrenButton()
      closeButton.parentNode.insertBefore(closeChildrenButton, closeButton)
      extLog('DEBUG', `CloseChildrenButton created for tab#${this.logDisplay(this)}`)
      console.log('closeButton created', closeButton, element)
    }

    return this
  }

  hideCloseChildrenButton () {
    this.hasChildren = false
    const element = this.findElement()
    if (!element) {
      return this.queueCommand('hideCloseChildrenButton', arguments)
    }

    const buttonClass = this.closeAllChildrenButtonClass()
    const button = element.querySelector('.' + buttonClass)
    if (button) {
      button.style.visibility = 'hidden'
      extLog('DEBUG', `closeChildrenButton hidden for tab#${this.logDisplay(this)}`)
      console.log('existingCloseAllButton', element)
    } else {
      extLog('INFO', `hideCloseChildrenButton missing element for tab${this.logDisplay(this)}`)
    }

    return this
  }

  createCloseChildrenButton () {
    const element = document.createElement('button')
    const buttonClass = this.closeAllChildrenButtonClass()

    element.title = 'Close tabs opened from this tab'
    element.classList.add('close')
    element.classList.add(buttonClass)
    element.innerHTML = TabController.closeChildrenButtonSVG()
    element.addEventListener('click', (_event) => {
      window.treeTabs.messaging.send({
        command: 'CloseChildren',
        tabId: this.tabId
      })
    })
    return element
  }

  closeAllChildrenButtonClass () {
    return 'close-children'
  }

  findElement () {
    const tabDomId = `tab-${this.tabId}`
    return document.getElementById(tabDomId)
  }

  setElement (element) {
    // element = element
    // return this
  }

  logDisplay(tab) {
    // return `${tab.tabId} ${tab.findElement().title}`
    return `${tab.tabId} ${tab.findElement().title}`
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
