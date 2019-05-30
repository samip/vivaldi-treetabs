/*
Control browser ui from extension.

Called from vivaldi-tabs extension to set tab indentation.
*/

class TabControl {
  constructor () {
    this.indentStep = 20
    this.indentUnit = 'px'
    this.indentAttribute = 'marginLeft'
  }

  IndentTab (tabId, indentLevel, pass) {
    pass = pass || 0
    console.log(this)
    console.log('Indent ' + tabId + ' to level ' + indentLevel)

    let element = document.getElementById('tab-' + tabId)

    // element found -> set indent
    if (element) {
      let indentVal = (indentLevel * this.indentStep) + this.indentUnit
      console.log(indentLevel + '*' + this.indentStep + '+' + this.indentUnit + '=' + indentVal + '  pass:' + pass)
      element.style[this.indentAttribute] = indentVal
    } else {
      // keep looking, fixme
      setTimeout(() => {
        this.IndentTab(tabId, indentLevel, pass++)
      }, 50)
    }
  }

  SetIndentStyle () {
    console.log('SetIndentStyle not implemented')
  }
}

/*
Receive message from extension.

Commands:

  IndentTab:
    tabId,
    indentLevel

  SetIndentStyle:
    indentValue: int
    indentAttribute: marginLeft, marginRight etc
    indentUnit: px, %, em
*/

chrome.runtime.onMessageExternal.addListener(
  function (request, sender, sendResponse) {
    console.log('external in browser.html', request, sender)

    var tabcontrol = new TabControl()

    switch (request.command) {
      case 'IndentTab':
        if (typeof request.tabId === 'undefined' || typeof request.indentLevel === 'undefined') {
          console.log('Undefined tabId or indentLevel')
        } else {
          tabcontrol.IndentTab(request.tabId, request.indentLevel)
        }
        break
      case 'SetIndentStyle':
        tabcontrol.SetIndentStyle()
        break
      default:
        console.log('Invalid command')
        break
    }
  }
)

chrome.runtime.sendMessage('pifflcjhdpciekonjecjkmpabmpfgddm', { test: 'aaba' })
