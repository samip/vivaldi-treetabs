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

enum newTabPosition { first_child, last_child };


chrome.tabs.onCreated.addListener((tab: Tab) => {
  let node = new Node(tab);
  nodelist.add(node);
  console.log(tab);
  // child tab created
  if (tab.openerTabId) {
    let parentTab = nodelist.get(tab.openerTabId);
    let parentIndex = parentTab.tab.index + 1;
    // chrome.tabs.move([node.id], {index: parentIndex});
    node.parentTo(parentTab);
    console.log('node', node, 'depth', node.depth());
    console.log('parented to ', parentTab);
    // node.waitingForRepositioning = true;
    chrome.runtime.sendMessage('mpognobbkildjkofajifpdfhcoklimli', {command: 'IndentTab', tabId: tab.id, indentLevel: node.depth()});
  } else {
    console.log('New root created at initial index', tab.index);
    // chrome.tabs.move([node.id], {index: 0});
    //moveToCorrectPosition(node, {fromIndex: node.tab.index});
    node.waitingForRepositioning = true;
  }
});

function moveToCorrectPosition(node:Node, moveInfo:any) {
  let firstChild = true;
  // let insideTree = !nodelist.get(moveInfo.toIndex).isRoot();
  let actualMove = () => {
    let sorted = nodelist.getSorted();
    let toNode = sorted[moveInfo.toIndex];
    if (toNode) {
      node.parentTo(toNode);
      console.log('Moved', node, 'under', toNode);
    }
  };


  if (node.isRoot()) {
    let host = nodelist.getSorted()[moveInfo.toIndex];
    if (firstChild) {
    } else {
      let lastSibling;
    }
  } else {
    let sortedSiblings = node.siblings().values.sort((a: Node, b: Node): number => {
      return a.tab.index - b.tab.index;
    });
    let firstSibling = sortedSiblings[0];
    let lastSibling = sortedSiblings[sortedSiblings.length];
  }

}

chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
  let node:Node = nodelist.get(tabId);
  let sorted = nodelist.getSorted();

  if (node.isRoot() && node.waitingForRepositioning) {
    /*
    Move root node to correct index
    Correct index is before the first root parent after initial index
     */
    let wasMoved = false;
    let previous:Node;

    let moveIndex = sorted.forEach((compare: Node, i: number) => {
      if (!wasMoved && i >= moveInfo.toIndex && compare.isRoot()) {
        // Found correct index, move to it and exit
        console.log(compare, 'is good neighbour at', i, compare.tab.index);
        console.log(compare.depth(), previous.depth());
        console.log(previous);
        chrome.tabs.move([tabId], {index: i});
        wasMoved = true;
      } else {
        console.log(compare, 'is bad neighbour at ', i, compare.tab.index);
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
