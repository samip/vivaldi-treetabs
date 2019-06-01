/*
    todo:
    tallenna tabien tilat ja mappaa ne käynnistyksen yhteydessä aukeaviin tabeihin
    Estä tabia aukeammasta keskelle treetä
    Tabin siirron käsittely

*/

// Enable chromereload by uncommenting this line:
import 'chromereload/devonly';
import Tab = chrome.tabs.Tab;
import Node from './Node';
import {nodelist} from './NodeList';


const options = {
  // Tab hierarchy is saved into local storage and restored if possible
  persistOverSession: true,
  newTabPosition: 'afterActive'
};

let browserExtensionId = 'mpognobbkildjkofajifpdfhcoklimli';


chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion);
});


chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    console.log('external received in background', request, sender);
  }
);


chrome.tabs.onCreated.addListener((tab: Tab) => {
  let node = new Node(tab);
  nodelist.add(node);

  if (tab.openerTabId) {
    let parentTab = nodelist.get(tab.openerTabId);
    if (!parentTab) {
      console.error('Missing parent ' + tab.openerTabId);
    } else {
      node.parentTo(parentTab);
    }
  } else {
    node.waitingForRepositioning = true; // set root up for repositioning to prevent broken leafs
  }
  chrome.runtime.sendMessage('mpognobbkildjkofajifpdfhcoklimli', {command: 'IndentTab', tabId: tab.id, indentLevel: node.depth()});
  chrome.runtime.sendMessage('mpognobbkildjkofajifpdfhcoklimli', {command: 'ShowId', tabId: tab.id});
  console.log(tab.index);
  // nodelist.store();
});

chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
  console.log(tabId, moveInfo);
  // nodelist.get(tabId).onMoved(moveInfo);

  let sorted = nodelist.getSorted();

  let self = nodelist.get(tabId);

  if (!self.waitingForRepositioning) {
    console.log('Skipping double for', tabId);
    return;
  }


  let selfIndex = moveInfo.toIndex;
  let takeFirstPossible = true;
  let found: Boolean = false;

  // Reposition new tab outside any group of children
  if (self.isRoot()) {
    for (let i = selfIndex + 0; i <= sorted.length; i++) {
      let item = sorted[i];
      if (!item || (item.isRoot())) {
        if (!found) {
          if (takeFirstPossible) {
            console.log('Moving ', self , ' PIVOT ', item);
            chrome.tabs.move([tabId], {index: i});
             chrome.runtime.sendMessage('mpognobbkildjkofajifpdfhcoklimli', {command: 'ShowId', tabId: tabId});
            found = true;
            self.waitingForRepositioning = false;
          }
        }
      }
    }
  }
});


chrome.windows.onRemoved.addListener(function (windowId) {
    nodelist.store(windowId);
});


chrome.tabs.onRemoved.addListener(function (tabId) {
    let node = nodelist.get(tabId);

    if (!node) {
        // should never happen
        console.log('Tab [' + tabId + '] not in container');
        return;
    }
    node.remove();
});

function main() {
  nodelist.build();
  nodelist.restoreHierarchy();
}

main();
