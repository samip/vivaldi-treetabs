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
import {NodeList, nodelist} from './NodeList';

let events:any = [];

function logEvent(id:number|undefined, type:any, param:any) {
  if (!id) {
    return;
  }
  if (typeof events[id] === 'undefined') {
    events[id] = [];
  }
  events[id].push( {'type': type, 'param': param, 'target':id });
}

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

  logEvent(tab.id, 'created', tab);

  console.log(events);
  let node = new Node(tab);
  nodelist.add(node);
  // child tab created
  if (tab.openerTabId) {
    let parentTab = nodelist.get(tab.openerTabId);
    let parentIndex = parentTab.tab.index + 1;
    // chrome.tabs.move([node.id], {index: parentIndex});
    node.parentTo(parentTab);
    // log('node', node, 'depth', node.depth());
    // log('parented to ', parentTab);
    // node.waitingForRepositioning = true;
    chrome.runtime.sendMessage('mpognobbkildjkofajifpdfhcoklimli', {command: 'IndentTab', tabId: tab.id, indentLevel: node.depth()});
  } else {
    log('New root created at initial index', tab.index, 'id:', tab.id);
    // chrome.tabs.move([node.id], {index: 0});
    // moveToCorrectPosition(node, {fromIndex: node.tab.index});
    node.waitingForRepositioning = true;
    node.firstPassGone = false;
  }
});


function rLog(msg:any) {
  console.log('%c  ' + msg, 'background: #222; color: #bada55');
}

chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
  let node:Node = nodelist.get(tabId);
  logEvent(tabId, 'moved' + (node.waitingForRepositioning) ? ' waiting' : 'skip', moveInfo);
  if (node.waitingForRepositioning) {
    // debugger;
  }

  let log = (...obj:any) => {
    let enable = true;
    if (enable) {
      console.log(...obj);
    }
  };








  if (node.isRoot() && node.waitingForRepositioning) {
     let sorted = nodelist.getSorted();

    // onMoved can trigger multiple times when Vivaldi-> process only once
    // first pass has

    rLog('STARTED ' + moveInfo.toIndex);

    node.waitingForRepositioning = false;

    let searchBelow = moveInfo.toIndex; // search for spot below created tab

    /*
    Move root node to correct index
    Correct index is before the first root parent after initial index
     */
    let wasMoved = false;
    let previous:Node;



    console.log('Search below', searchBelow);
    let inspectSpot = (compare:Node, i:number) => {
      let isLast = i === sorted.length - 1;
      // Have to take last spot
      if (isLast) {
        console.log('last spot');
        return true;
      }

      let isRoot = compare.isRoot();
      let noChildren = compare.children.isEmpty();

      if (compare.id === node.id) {
        console.log(events);
        console.error('compare to self', compare, i);
        // debugger;
        return false;
      }

      if (compare.isRoot()) {
        if (noChildren) {
          console.log('childless root', compare, i);
          return true;
        } else {
          // console.log('childful root', compare, i);
          return false;
        }
      } else {
        const next = sorted[i];
        if (next.isRoot()) {
          console.log('child next is root', next);

          return true;
        }
        return false;
        return next.isRoot();

      }
      return false;
    };
    /*
    let index = sorted.indexOf(node);
    let filtered;
    if (index > -1) {
      sorted.splice(index, 1);
    }
    */

    for (let i = searchBelow; i < sorted.length; i++) {
      let compare:Node = sorted[i];
         // console.log(compare.tab.title, i);
      // ei toimi vikalla tabilla
      let isLast = i === sorted.length - 1;

      let goodSpot = inspectSpot(compare, i);

      if (goodSpot) {
        // Found correct index, move to it and exit

        if (compare.id === node.id) {
          console.error('self compare', node, i);
          console.log(events[node.id]);
          i++;
          continue;
        }
        /*
        log(compare.tab.title, 'is good neighbour at at index', i, compare.tab.index, 'depth:', compare.depth(), compare);
        //log(previous.tab.title, 'is another neighbour at index', previous.tab.index, 'depth:', previous.depth(), previous);
        log(node.tab.title, ' is moved to ', i, node);
        */

        chrome.tabs.move([tabId], {index: i});
        console.log(tabId, 'moving to', i, ' from ', searchBelow);
        chrome.runtime.sendMessage('mpognobbkildjkofajifpdfhcoklimli', {
          command: 'ShowId',
          tabId: compare.id,
        });
        break;

        /*
        chrome.runtime.sendMessage('mpognobbkildjkofajifpdfhcoklimli', {
          command: 'appendAttribute',
          attribute: 'style',
          value: 'background-color: red',
          tabId: compare.id,
        });
        */

      }

      previous = compare;
    }

    sorted.forEach( (node:Node, i:number) => {
      if (i !== node.tab.index) {
        let tabId:number = node.id;
        console.error('Invalid sorted order or tab index', i, node.tab.index, node);
        console.log(events[tabId]);
      }
      chrome.runtime.sendMessage('mpognobbkildjkofajifpdfhcoklimli', {
          command: 'SetText',
          tabId: node.id,
          text: node.tab.id + '-' + i + '-'
      });
    });

  }

  node.firstPassGone = true;
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


   // console.log(node, nodelist.get(tabId));
});

function main() {
  nodelist.build();
  nodelist.restoreHierarchy();
}

main();
