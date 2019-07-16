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

    let element = this.getElement(tabId);

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

  appendAttribute (tabId, attribute, value) {
    let element = this.getElement(tabId);
    let oldValue = element.getAttribute(attribute);
    element.setAttribute(attribute, oldValue + ';' + value);
  }

  setAttribute (tabId, attribute, value) {
    let element = this.getElement(tabId);
    element.setAttribute(attribute, value);
  }

  ShowId (tabId) {
    this.SetText(tabId, tabId);
  }

  SetText (tabId, text) {
    let element = this.getElement(tabId);
    if (!element) {
      console.log('Missing element for tabId' + tabId);
      return;
    }
    let oldTitle = element.querySelector('.title');
    let oldCustom = oldTitle.querySelector('.custom-title')
    if (oldCustom) {
      oldCustom.innerText = text;
    } else {
      let textElement = document.createElement('span');
      oldTitle.innerHTML = '<span class="custom-title">' + text + '</span>' + oldTitle.innerHTML;
      //textElement.classList.add('custom-title');
      //textElement.innerText = text;

      //textElement.prepend(oldTitle);
    }
    if (oldTitle) {
      // element.querySelector('.title > .custom-title').innerText = text + ' ' + oldTitle;
    }
  }

  getElement (tabId) {
    return document.getElementById('tab-' + tabId)
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
        break;
      case 'SetIndentStyle':
        tabcontrol.SetIndentStyle()
        break;
      case 'ShowId':
        if (request.tabId) {
          tabcontrol.ShowId(request.tabId, request.indentLevel);
        }
        break;
      case 'SetText':
        tabcontrol.SetText(request.tabId, request.text);
        break;
      case 'appendAttribute':
        // UNSAFE
        tabcontrol.appendAttribute(request.tabId, request.attribute, request.value)
        break;
      default:
        console.log('Invalid command')
        break
    }
  }
)

chrome.runtime.sendMessage('pifflcjhdpciekonjecjkmpabmpfgddm', { test: 'aaba' })
