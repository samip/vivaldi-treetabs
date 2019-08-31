/*
Extension of Vivaldi Tabs extension.
*/

chrome.runtime.onMessageExternal.addListener(
  function (request, sender, sendResponse) {
    console.log('external in browser.html', request, sender)

    var tabcontrol = new TabControl()

    switch (request.command) {
      /*
      Indents tab

      @param tabId
      @param indentLevel - how many steps tab needs to be indented. One step is by default 20 px
       */
      case 'IndentTab':
        if (typeof request.tabId === 'undefined' || typeof request.indentLevel === 'undefined') {
          console.log('Undefined tabId or indentLevel')
        } else {
          tabcontrol.IndentTab(request.tabId, request.indentLevel)
        }
        break;

      /*
       * Show tab's id next to it's title. Used in debugging only.
       *
       * @param tabId
       */
      case 'ShowId':
        if (request.tabId) {
          tabcontrol.ShowId(request.tabId, request.indentLevel);
        }
        break;

      /* Append attribute to tab strip. Used in debugging only.
       *
       */
      case 'appendAttribute':
        // UNSAFE
        tabcontrol.appendAttribute(request.tabId, request.attribute, request.value)
        break;

      /* Show or create 'Close child tabs' button in tab strip
       * @param TabId
       */
      case 'showCloseChildrenButton':
        tabcontrol.showCloseChildrenButton(request.tabId);
        break;

      /* Hide 'Close child tabs' button in tab strip
       * @param TabId
       */
      case 'hideCloseChildrenButton':
        tabcontrol.hideCloseChildrenButton(request.tabId);
        break;

      default:
        console.log('Invalid command');
        return sendResponse('Invalid command: ' + request.command);
        break
    }

    sendResponse(request.command + ' executed');
  }
)

/*
Control browser ui from extension.

Called from vivaldi-tabs extension to set tab indentation.

example tab strip html:

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
    if (!element) {
      setTimeout(() => {
        this.IndentTab(tabId, indentLevel, pass++)
      }, 50)
    }

    let indentVal = (indentLevel * this.indentStep) + this.indentUnit;
    console.log(indentLevel + '*' + this.indentStep + '+' + this.indentUnit + '=' + indentVal + '  pass:' + pass);
    element.style[this.indentAttribute] = indentVal;
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
      oldTitle.innerHTML = '<span class="custom-title">' + text + '</span>' + oldTitle.innerHTML;
    }
  }

  showCollapseChildrenButton (tabId) {
    /*
     * This is next to impossible to implement since tabs have relative top coordinates calculated by Vivaldi.
     */
  }

  showCloseChildrenButton (tabId) {
    let element = this.getElement(tabId);
    if (!element) {
      // keep looking, fixme
      setTimeout(() => {
        showCloseChildrenButton(tabId);
      }, 50)
    }

    let buttonClass = TabControl.getCloseChildrenButtonClassname();
    let closeButton = element.querySelector('.close');
    let existingButton = element.querySelector('.' + buttonClass);

    if (existingButton) {
      existingButton.style.visibility = 'initial';
    } else {
      let closeChildrenButton = document.createElement('button');
      closeChildrenButton.title = 'Close child tabs';
      closeChildrenButton.classList.add('close');
      closeChildrenButton.classList.add(buttonClass);
      closeChildrenButton.innerHTML = TabControl.getCloseChildrenButtonSVG();
      closeChildrenButton.addEventListener('click', (event) => onClickedCloseChildren(event, tabId) );
      closeButton.parentNode.insertBefore(closeChildrenButton, closeButton); // insert closeChildrenButton before the real close button
    }
  }

  hideCloseChildrenButton (tabId) {
    let element = this.getElement(tabId);
    let buttonClass = TabControl.getCloseChildrenButtonClassname();
    let button = element.querySelector('.' + buttonClass);
    if (button) {
      button.style.visibility = 'hidden';
    }
  }

  static getCloseChildrenButtonClassname() {
    return 'close-children';
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
          </svg>`;
  }

  getElement (tabId) {
    return document.getElementById('tab-' + tabId)
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
  /// Send message back to extension
  sendMessage(message, responseCallback) {
    chrome.runtime.sendMessage(this.id, message, {}, function(response) {
      if (typeof responseCallback === 'function') {
        responseCallback(response);
      }
    });
  }
}

/// "Close Children" button clicked. Send close children command to the extension
function onClickedCloseChildren(event, tabId) {
  // send Close Children signal to extension
  let cmdObj = { command: 'CloseChildren', tabId: tabId  };
  let bridge = new ExtensionBridge();
  bridge.sendMessage(cmdObj);
}
