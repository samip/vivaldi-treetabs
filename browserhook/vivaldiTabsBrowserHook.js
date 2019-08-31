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

var eventQueue = new Map();

let observer = new MutationObserver(function(mutations) {
  console.log(mutations);
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
    mutation.addedNodes.forEach((node) => {
      let tab = node.querySelector('.tab');
      let tab_id = tab.id.split('-')[1];
      console.log('created', tab_id);
      const requestForTab = eventQueue[tab_id];
      if (requestForTab) {
        console.log('queue', requestForTab);
        handleCommand(requestForTab, (s) => console.log('mutilated'));
      } else {
        console.log('no queue');
      }
    });
    }
  });
});

function initObserver() {
  let tabStrip = document.getElementsByClassName('tab-strip')[0];
  if (!tabStrip) {
    setTimeout(() => {
          initObserver();
        }, 50);
    return;
  }

  observer.observe(document.getElementsByClassName('tab-strip')[0], {
    attributes: false,
    childList: true,
    characterData: false
  });

}

initObserver();

function handleCommand(request, sendResponse) {
  var tabcontrol = new TabControl();
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
      case 'showCloseChildrenButton':
        tabcontrol.showCloseChildrenButton(request.tabId);
        break;
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

chrome.runtime.onMessageExternal.addListener(
  function (request, sender, sendResponse) {
    console.log('external in browser.html', request, sender)

    var tabcontrol = new TabControl();
    handleCommand(request, sendResponse);
    sendResponse({});
    return;

    if (request.tabId) {
      const strip = tabcontrol.getElement(request.tabId);
      if (!strip) {
        eventQueue[request.tabId] = request;
        return;
      }
    }
    handleCommand(request, sendResponse);
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

  async IndentTab (tabId, indentLevel) {
    /*
    this.getTabElement(tabId, 1)
    .then( (element) => {
      console.log(element);
      let indentVal = (indentLevel * this.indentStep) + this.indentUnit;
      console.log(indentLevel + '*' + this.indentStep + '+' + this.indentUnit + '=' + indentVal);
      element.style[this.indentAttribute] = indentVal;
    })
    .catch(error => {
      console.error('promise error' + error);
    });
    */

    try {
      let element = await this.getTabElement(tabId, 500);
      let indentVal = (indentLevel * this.indentStep) + this.indentUnit;
      console.log(indentLevel + '*' + this.indentStep + '+' + this.indentUnit + '=' + indentVal);
      element.style[this.indentAttribute] = indentVal;
    } catch(error) {
      console.error('promise error' + error);
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

    if (!element) {
      // keep looking, fixme
      setTimeout(() => {
        showCloseChildrenButton(tabId);
      }, 50)
    }

    let buttonClass = TabControl.getCloseChildrenButtonClassname();
    let closeButton = element.querySelector('.close');
    let alreadyCreated = closeButton.previousSibling.classList.contains(buttonClass);
    let existingButton = element.querySelector('.' + buttonClass);
    console.log(existingButton);
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

  /// icon for close children button
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

  async getTabElement(tabId, rejectTime) {
    // return new Promise((resolve, reject) => {
      var hasChanged = false;

      let observer = new MutationObserver(function(mutations) {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              let tab = node.querySelector('.tab');
              let tab_id = tab.id.split('-')[1];
              if (tab_id == tabId) {
                hasChanged = true;
                return tab;
                resolve(tab);
              }
            });
        }
        });
      }); // observer

      if (rejectTime > 0) {
        window.setTimeout(()=> {
          if (!hasChanged) {
            throw new Error(tabId + ' not found in ' + rejectTime);
          }
        }, rejectTime * 100);
      }

      const target = document.getElementsByClassName('tab-strip')[0];

      observer.observe(target, {
        attributes: false,
        childList: true,
        characterData: false
      });

    // });
    // promise
  }

  async


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
Close Children clicked
*/
function onClickedCloseChildren(event, tabId) {
  // send Close Children signal to extension
  let cmdObj = { command: 'CloseChildren', tabId: tabId  };
  let bridge = new ExtensionBridge();
  bridge.sendMessage(cmdObj);
}
