/*
Control browser ui from extension.

Called from vivaldi-tabs extension to set tab indentation.

example tab strip, called element in code:

<div id="tab-37" class="tab active" tabindex="-1">
  <div class="tab-header">
    <span class="favicon jstest-favicon-image">
    <img width="16" height="16" alt="" srcset="chrome://favicon/size/16@2x/ht"></span>
    <span class="title">DevTools - chrome-extension://mpognobbkildjkofajifpdfhcoklimli/browser.html</span>
    <button class="close" title="Close Tab Alt click to close other tabs except this one">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
      <path d="M13.5 6l-1.4-1.4-3.1 3-3.1-3L4.5 6l3.1 3.1-3 2.9 1.5 1.4L9 10.5l2.9 2.9 1.5-1.4-3-2.9"></path>
    </svg>
    </button>
  </div>
  <div class="tab-group-indicator"></div>
</div>

*/

class TabControl {

  constructor () {
    this.indentStep = 20;
    this.indentUnit = 'px';
    this.indentAttribute = 'marginLeft';
  }

  IndentTab (tabId, indentLevel, pass) {
    pass = pass || 0

    let element = this.getElement(tabId);

    // element found -> set indent
    if (element) {
      let indentVal = (indentLevel * this.indentStep) + this.indentUnit
      console.log(indentLevel + '*' + this.indentStep + '+' + this.indentUnit + '=' + indentVal + '  pass:' + pass)
      element.style[this.indentAttribute] = indentVal
    } else {
      // keep looking, fixme
      setTimeout(() => {
        this.IndentTab(tabId, indentLevel, pass++);
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
    let oldCustom = oldTitle.querySelector('.custom-title');
    if (oldCustom) {
      oldCustom.innerText = text;
    } else {
      oldTitle.innerHTML = '<span class="custom-title">' + text + '</span>' + oldTitle.innerHTML;
    }
  }

  showCollapseChildrenButton (tabId) {
    /*
    This is next to impossible to implement since tabs have relative top coordinates
    */
  }

  showCloseChildrenButton (tabId) {
    let element = this.getElement(tabId);
    let buttonClass = TabControl.getCloseChildrenButtonClassname();
    let closeButton = element.querySelector('.close');
    let alreadyCreated = closeButton.previousSibling.classList.contains(buttonClass);

    if (alreadyCreated) {
      closeButton.previousSibling.style.display = 'none';
    } else {
      let closeChildrenButton = document.createElement('span');
      closeChildrenButton.classList.add('close');
      closeChildrenButton.classList.add(buttonClass);
      closeChildrenButton.addEventListener('click', (event) => onClickedCloseChildren(event, tabId) );
      closeButton.parentNode.insertBefore(closeChildrenButton, closeButton); // insert closeChildrenButton before the real close button
    }
  }

  hideCloseChildrenButton (tabId) {
    let element = this.getElement(tabId);
    let buttonClass = TabControl.getCloseChildrenButtonClassname();
    let button = element.querySelector('.' + buttonClass)[0];
    button.style.display = 'block';
  }

  static getCloseChildrenButtonClassname() {
    return 'close-children';
  }

  getElement (tabId) {
    return document.getElementById('tab-' + tabId);
  }
}



// TODO: https://developer.chrome.com/extensions/messaging check long live connections
class ExtensionBridge {
  constructor(id) {
    if (id) {
      this.id = id;
    } else {
      this.id = 'pifflcjhdpciekonjecjkmpabmpfgddm'; // TOOD: get from chrome.runtime.onMessageExternal sender parameter
    }
  }

  sendMessage(message, responseCallback) {
    chrome.runtime.sendMessage(this.id, message, {}, function(response) {
      if (typeof responseCallback === 'function') {
        responseCallback(response);
      }
    });
  }
}

/*
Close Children button clicked
*/
function onClickedCloseChildren(event, tabId) {
  // send Close Children signal to extension
  let cmdObj = { command: 'CloseChildren', tabId: tabId  };
  let bridge = new ExtensionBridge();
  bridge.sendMessage(cmdObj);
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
    console.log('external in browser.html', request, sender);

    var tabcontrol = new TabControl()

    switch (request.command) {
      case 'IndentTab':
        if (typeof request.tabId === 'undefined' || typeof request.indentLevel === 'undefined') {
          console.log('Undefined tabId or indentLevel');
        } else {
          tabcontrol.IndentTab(request.tabId, request.indentLevel);
        }
        console.log('indent');
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
        tabcontrol.appendAttribute(request.tabId, request.attribute, request.value);
        break;
      case 'showCloseChildrenButton':
        tabcontrol.showCloseChildrenButton(request.tabId);
        break;
      case 'hideCloseChildrenButton':
        tabcontrol.hideCloseChildrenButton(request.tabId);
        break;
      default:
        console.log('Invalid command');
        return sendResponse('Invalid command: ' + request.command);
        break;
    }

    sendResponse(request.command + ' executed');
  }
)
