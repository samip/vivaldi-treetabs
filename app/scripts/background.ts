/// <reference path="Node.ts">

// Enable chromereload by uncommenting this line:
import 'chromereload/devonly';
import Tab = chrome.tabs.Tab;
import Node from './Node';
import {nodelist} from './NodeList';


var browserExtensionId = 'mpognobbkildjkofajifpdfhcoklimli';

nodelist.init();

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


  //console.log(node.depth());
  //console.log('Created tab', tab);


chrome.runtime.sendMessage('mpognobbkildjkofajifpdfhcoklimli', {command: 'IndentTab', tabId: tab.id, indentLevel: node.depth()});
chrome.runtime.sendMessage('mpognobbkildjkofajifpdfhcoklimli', {command: 'ShowId', tabId: tab.id});
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
