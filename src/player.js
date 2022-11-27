/**
 * Runs "trigger" function after setting up MutationObserver and (optionally) Timeout
 * that respectively resolve or reject the Promise. The resolve function gets an array
 * (not NodeList) of elements that were added as argument. If the trigger function
 * returns true the Promise is immediately resolved with an empty array, without waiting
 * for a Mutation.
 *
 * @param {Function} trigger Function to run after setting up MutationObserver and Timeout.
 * @param {Object} watch DOM Element to watch for Mutations.
 * @param {string} [query=*] Selector query that elements added in the Observed Mutation must match.
 * @param {Object} [options={attributes:false, childList: true, subtree: false}] Options passed to MutationObserver.
 * @param {int=} timeout Milliseconds after which the Promise should reject. If ommitted no Timeout is set.
 * @returns {Promise} Promise object represents the added elements
 */
function mop(trigger, watch, query, options, timeout) {
  return new Promise((resolve, reject) => {
    let timer;
    let observer = new MutationObserver((mutationList) => {
      let any = searchMutationListFor(mutationList, query || "*");
      if (query && !any) {
        return;
      }
      observer.disconnect();
      clearTimeout(timer);
      resolve(any);
    });
    observer.observe(
      watch,
      options || { attributes: false, childList: true, subtree: false },
    );
    if (timeout) {
      timer = setTimeout(() => {
        observer.disconnect();
        reject(new Error("Timed out observing mutation"));
      }, timeout);
    }
    if (trigger()) {
      observer.disconnect();
      clearTimeout(timer);
      resolve([]);
    }
  });
}
/**
 * Searches mutations from MutationObserver for elements matching a query. Returns
 * either false or an array with found matching elements.
 *
 * @param {Object[]} mutationList List of Mutations as passed to MutationObserver's callback.
 * @param {string} [query] Selector query that elements added in the Observed Mutation must match.
 * @returns {false|Object[]}
 */
function searchMutationListFor(mutationList, query) {
  if (!mutationList.length) {
    return false;
  }
  let foundNodes = [];
  function findNodes(addedNode) {
    if (addedNode.matches(query)) {
      foundNodes.push(addedNode);
    }
    foundNodes = foundNodes.concat(
      Array.from(addedNode.querySelectorAll(query)),
    );
  }
  for (let m = 0; m < mutationList.length; m++) {
    if (!mutationList[m].addedNodes.length) continue;
    Array.from(mutationList[m].addedNodes)
      .filter((nod) => nod.nodeType == 1)
      .forEach(findNodes);
  }
  if (!foundNodes.length) {
    return false;
  }
  return foundNodes;
}

const testing = true
const runParalel = async () => {
  const wrapper = mop((e) => console.log('found',e), document.documentElement, 'div', null, 1000)
  const player = mop((e) => console.log('found',e), document.documentElement, 'vrtnu-player', null, 1000)
  return Promise.all([wrapper, player])
}
if (document.readyState === 'loading') {
  (async () => {
    if (testing) console.time('START test')
    await runParallel()
    if (testing) console.timeEnd('END test no blocking')
  })()
} else if (testing) {
  window.location.reload(true)
}
