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

chrome.commands.onCommand.addListener(function(command) {
  let log = (message:string) => {
   let enabled = true;
   if (enabled) {
     console.log(message);
   }
  };
  log('Received command:' + command);
  switch (command) {
    case 'close-child-tabs':
      log('Close child tabs');
      break;
    default:
      console.error('Unknown command');
      break;
  }
});

chrome.tabs.onCreated.addListener((tab: Tab) => {
  let log = (...obj:any) => {
    let enable = true;
    if (enable) {
      console.log(...obj);
    }
  };


  let node = new Node(tab);
  nodelist.add(node);
  // child tab created
  if (tab.openerTabId) {
    let parentTab = nodelist.get(tab.openerTabId);
    let parentIndex = parentTab.tab.index + 1;
    // chrome.tabs.move([node.id], {index: parentIndex});
    node.parentTo(parentTab);
    log('node', node, 'depth', node.depth());
    log('parented to ', parentTab);
    // node.waitingForRepositioning = true;
    chrome.runtime.sendMessage('mpognobbkildjkofajifpdfhcoklimli', {command: 'IndentTab', tabId: tab.id, indentLevel: node.depth()});
  } else {
    log('New root created at initial index', tab.index);
    // chrome.tabs.move([node.id], {index: 0});
    // moveToCorrectPosition(node, {fromIndex: node.tab.index});
    node.waitingForRepositioning = true;
  }
});



chrome.tabs.onMoved.addListener((tabId, moveInfo) => {

  let log = (...obj:any) => {
    let enable = false;
    if (enable) {
      console.log(...obj);
    }
  };

  let node:Node = nodelist.get(tabId);
  let sorted = nodelist.getSorted();

  if (node.isRoot() && node.waitingForRepositioning) {
    node.waitingForRepositioning = false;

    /*
    Move root node to correct index
    Correct index is before the first root parent after initial index
     */
    let wasMoved = false;
    let previous:Node;

    let moveIndex = sorted.forEach((compare: Node, i: number) => {
      // console.log(compare.tab.title, i);
      // ei toimi vikalla tabilla
      let isLast = i === sorted.length - 1;
      if (!wasMoved && isLast ||  (i >= moveInfo.toIndex && compare.isRoot() && compare.id !== node.id)) {
        // Found correct index, move to it and exit
        if (compare.id === node.id) {
          console.error('compared to self', compare, i);
        }

        log(compare.tab.title, 'is good neighbour at at index', i, compare.tab.index, 'depth:', compare.depth(), compare);
        log(previous.tab.title, 'is another neighbour at index', previous.tab.index, 'depth:', previous.depth(), previous);
        log(node.tab.title, ' is moved to ', i, node);

        chrome.tabs.move([tabId], {index: i});

        chrome.runtime.sendMessage('mpognobbkildjkofajifpdfhcoklimli', {
          command: 'ShowId',
          tabId: compare.id,
        });

        chrome.runtime.sendMessage('mpognobbkildjkofajifpdfhcoklimli', {
          command: 'appendAttribute',
          attribute: 'style',
          value: 'background-color: red',
          tabId: compare.id,
        });

        wasMoved = true;
      } else {
        // console.log(compare, 'is bad neighbour at ', i, compare.tab.index);
      }
      previous = compare;
    });
  }
  // moveToCorrectPosition(node, moveInfo);
});


chrome.windows.onRemoved.addListener(function (windowId) {
    nodelist.store(windowId);
});


chrome.tabs.onRemoved.addListener(function (tabId) {
    let node = nodelist.get(tabId);

    if (!node) {
        // should never happen
        console.error('Tab [' + tabId + '] not in container');
        return;
    }
    nodelist.remove(node);
    node.remove();
    console.log(node, nodelist.get(tabId));
});

function main() {
  nodelist.build();
  nodelist.restoreHierarchy();
}

main();
