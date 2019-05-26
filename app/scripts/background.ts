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
  persistOverSession: true
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
  }
  chrome.runtime.sendMessage('mpognobbkildjkofajifpdfhcoklimli', {command: 'IndentTab', tabId: tab.id, indentLevel: node.depth()});
  chrome.runtime.sendMessage('mpognobbkildjkofajifpdfhcoklimli', {command: 'ShowId', tabId: tab.id});
  console.log(nodelist.values);
  // nodelist.store();
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
