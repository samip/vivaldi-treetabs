class UIController {

  constructor () {
    this.tabs = {}
  }

  tab (tabId) {
    if (!this.tabs[tabId]) {
      this.tabs[tabId] = new TabCommand(tabId, this.getElement(tabId))
    } else {
      this.tabs[tabId].setElement(this.getElement(tabId))
    }

    return this.tabs[tabId]
  }

  showRefreshViewButton () {
    const buttonId = 'refresh-tab-tree'
    // Busted
    const existing = document.getElementById(buttonId)
    if (existing) {
      extLog('Skipping show refresh view button.. button already rendered')
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
      window.treeTabs.messaging.send({ command: 'RenderAllTabs' })
    })

    return button
  }

  getElement (tabId) {
    return document.getElementById('tab-' + tabId)
  }
}
