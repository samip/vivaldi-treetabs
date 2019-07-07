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



const onInstalled = chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion);
});


const onMessageExternal = chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    console.log('external received in background', request, sender);

    if (request.command) {
      switch (request.command) {
        case 'build':
          root.children = new NodeList;
          nodelist.build(root);
          console.log(nodelist.values);
          sendResponse({'nodelist': nodelist});
          break;
        case 'get':
          console.log(nodelist, root);
          sendResponse({'nodelist': nodelist});
          break;
        case 'show_ids':
          nodelist.values.forEach((node:Node) => {
            node.command('ShowId');
          });
          break;
      }
    }
  }
);


const onCommand = chrome.commands.onCommand.addListener(function(command) {
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

const onCreated = chrome.tabs.onCreated.addListener((tab: Tab) => {
  let node = new Node(tab);

  // child tab created
  if (tab.openerTabId) {
    nodelist.add(node);
    let parentTab = nodelist.get(tab.openerTabId);
    node.parentTo(parentTab);
    node.command('IndentTab', {tabId: tab.id, indentLevel: node.depth()});
  } else {
    nodelist.add(node);
    node.parentTo(root);
    node.initialIndex = tab.index;
    node.waitingForRepositioning = true;
  }
});

const onRemoved = chrome.tabs.onRemoved.addListener(function (tabId) {
    let node = nodelist.get(tabId);
    if (!node) {
        // should never happen
        console.error('Tab [' + tabId + '] not in container', root);
        return;
    }

    nodelist.remove(node);
    node.remove();
});

const onMoved = chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
  let node:Node = nodelist.get(tabId);
  const correctEvent = node.initialIndex === moveInfo.fromIndex;

  if (node.waitingForRepositioning && correctEvent) {
    let searchBelow = moveInfo.toIndex; // search for spot below created tab

    chrome.tabs.query({}, function (items) {
      for (let i = 0; i < items.length; i++) {
        let id = items[i].id;
        if (!id) {
          continue;
        }

        let compare = nodelist.get(id);
        if (!compare) {
          compare = new Node(items[i]);
          nodelist.add(compare);
        }

        let next;
        let isLast = i === items.length - 1;
        if (!isLast) {
          let next_chrome = items[i + 1];
          if (next_chrome) {
            let next_id = next_chrome.id;

            if (next_id) {
              next = nodelist.get(next_id);
            }
          } else {
            isLast = true;
          }
        } else {
          isLast = true;
        }

        let goodSpot = i >= searchBelow && inspectSpot(compare, next, i);

        if (isLast || goodSpot) {
          // Found correct index, move to it and exit
          chrome.tabs.move([tabId], {index: i});
          console.log(tabId, 'moving below',compare.tab.id, 'index:', compare.tab.index, i, ' from ', searchBelow);
          node.waitingForRepositioning = false;
          return;
        }
      }
    });

    let inspectSpot = (compare:Node, next:Node|undefined, i:number) => {
      let noChildren = compare.children.isEmpty();

      if (compare.id === node.id) {
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
        if (next && next.isRoot()) {
          console.log('child next is root', next);
          return true;
        }
        return false;
      }
    };

  }
});


const root = new Node();
nodelist.build(root);
console.log(root);

