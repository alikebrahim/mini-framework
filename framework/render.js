import { updateEvents, removeEvents } from './events.js';

/**
 * Renders a virtual DOM node into a real DOM container.
 * This implementation includes diffing and patching of the VDOM.
 * @param {object} vnode - The virtual DOM node (from h function) or a string (text node).
 * @param {HTMLElement} container - The real DOM element to render into.
 */
export function render(rawVnode, container) {
  const oldProcessedVnode = container._vdom || null;
  const newProcessedVnode = patch(container, rawVnode, oldProcessedVnode);
  container._vdom = newProcessedVnode;
}

// Creates a DOM element and a corresponding processed VDOM object.
// A "processed VDOM object" always has a .dom property and its children are also processed.
// Text nodes are represented as { type: "#text", value: "...", dom: ... }
function _createProcessedVnodeAndDom(rawVnode) {
  if (rawVnode == null) return null;

  if (typeof rawVnode === 'string' || typeof rawVnode === 'number') {
    const domNode = document.createTextNode(rawVnode.toString());
    return { type: '#text', value: rawVnode, dom: domNode, children: [] };
  }

  // Element node
  const domElement = document.createElement(rawVnode.tag);
  const newProps = rawVnode.attrs || {};
  const newKey = newProps.key;

  const processedVnode = {
    type: rawVnode.tag,
    props: newProps,
    children: [],
    dom: domElement,
    key: newKey,
  };

  updateProps(domElement, newProps, {});

  const rawChildren = rawVnode.children || [];
  for (const rawChild of rawChildren) {
    if (rawChild != null) {
      const processedChild = _createProcessedVnodeAndDom(rawChild);
      if (processedChild && processedChild.dom) {
        domElement.appendChild(processedChild.dom);
        processedVnode.children.push(processedChild);
      }
    }
  }
  return processedVnode;
}

// Patches the DOM and returns the new processed VDOM node.
// parentElement: The DOM element to append to if creating a new node at the root.
//                For children, this is the actual parent DOM element.
// newRawVnode: The new VDOM node, potentially with primitive children (from h()).
// oldProcessedVnode: The old VDOM node from state, with .dom and processed children.
function patch(parentElement, newRawVnode, oldProcessedVnode) {
  // 1. If newRawVnode is null, remove old node
  if (newRawVnode == null) {
    if (oldProcessedVnode && oldProcessedVnode.dom && oldProcessedVnode.dom.parentNode) {
      removeEvents(oldProcessedVnode.dom); // Clean up events
      oldProcessedVnode.dom.parentNode.removeChild(oldProcessedVnode.dom);
    }
    return null; // No new VDOM node
  }

  // 2. If oldProcessedVnode is null, create and append new node
  if (oldProcessedVnode == null) {
    const newProcessedNode = _createProcessedVnodeAndDom(newRawVnode);
    if (newProcessedNode && newProcessedNode.dom) {
      parentElement.appendChild(newProcessedNode.dom);
    }
    return newProcessedNode;
  }

  // Both newRawVnode and oldProcessedVnode exist.
  const domNode = oldProcessedVnode.dom; // This is the DOM node to update or replace.

  const isNewRawText = typeof newRawVnode === 'string' || typeof newRawVnode === 'number';
  const isOldProcessedText = oldProcessedVnode.type === '#text';

  // 3. If both are text nodes
  if (isNewRawText && isOldProcessedText) {
    if (newRawVnode !== oldProcessedVnode.value) {
      domNode.textContent = newRawVnode.toString();
    }
    return { ...oldProcessedVnode, value: newRawVnode }; // Update value in processed VDOM
  }

  // 4. If one is text and the other is element, replace
  if (isNewRawText || isOldProcessedText) {
    const newProcessedNode = _createProcessedVnodeAndDom(newRawVnode);
    if (domNode.parentNode) {
      domNode.parentNode.replaceChild(newProcessedNode.dom, domNode);
    }
    return newProcessedNode;
  }

  // 5. If node types (tags) are different, replace (both are elements now)
  if (newRawVnode.tag !== oldProcessedVnode.type) {
    const newProcessedNode = _createProcessedVnodeAndDom(newRawVnode);
    if (domNode.parentNode) {
      domNode.parentNode.replaceChild(newProcessedNode.dom, domNode);
    }
    return newProcessedNode;
  }

  // 6. Same type, both elements. Update props and patch children.
  const newProps = newRawVnode.attrs || {};
  updateProps(domNode, newProps, oldProcessedVnode.props);

  const newProcessedChildren = patchChildren(
    domNode,
    newRawVnode.children || [],
    oldProcessedVnode.children // These are already processed
  );

  return {
    ...oldProcessedVnode, // type, dom, key
    props: newProps,
    children: newProcessedChildren,
  };
}

// ... updateProps remains the same ...
// ... existing updateProps function ...
function updateProps(domElement, newProps, oldProps = {}) {
  newProps = newProps || {};
  oldProps = oldProps || {};

  // Extract event props separately
  const oldEventProps = {};
  const newEventProps = {};
  
  for (const key in oldProps) {
    if (key.startsWith('on') && typeof oldProps[key] === 'function') {
      oldEventProps[key] = oldProps[key];
    }
  }
  
  for (const key in newProps) {
    if (key.startsWith('on') && typeof newProps[key] === 'function') {
      newEventProps[key] = newProps[key];
    }
  }
  
  // Update events using custom event system
  updateEvents(domElement, newEventProps, oldEventProps);

  // Remove old props that are not in new props or are nullified
  for (const key in oldProps) {
    if (key === 'children' || key === 'key') continue;
    if (key.startsWith('on')) continue; // Already handled by updateEvents
    
    if (!(key in newProps) || newProps[key] == null) {
      if (key === 'style' && typeof oldProps[key] === 'object') {
        for (const styleName in oldProps[key]) {
          domElement.style[styleName] = '';
        }
      } else if (typeof domElement[key] === 'boolean' && key !== 'className') {
        domElement[key] = false;
        domElement.removeAttribute(key);
      } else {
        domElement.removeAttribute(key);
      }
    }
  }

  // Add/update new props
  for (const key in newProps) {
    if (key === 'children' || key === 'key') continue;
    if (key.startsWith('on')) continue; // Already handled by updateEvents

    const newValue = newProps[key];
    const oldValue = oldProps[key];

    if (newValue === oldValue && key !== 'value' && typeof newValue !== 'object') continue;
    if (newValue == null) continue;

    if (key === 'className') {
      if (domElement.getAttribute('class') !== newValue) {
        domElement.setAttribute('class', newValue);
      }
    } else if (key === 'style' && typeof newValue === 'object') {
      if (typeof oldProps.style === 'object') {
        for (const styleName in oldProps.style) {
          if (!newValue || newValue[styleName] == null) {
            domElement.style[styleName] = '';
          }
        }
      }
      for (const styleName in newValue) {
        if (domElement.style[styleName] !== newValue[styleName]) {
          domElement.style[styleName] = newValue[styleName];
        }
      }
    } else if (key === 'value') {
      if (domElement.tagName === 'INPUT' || domElement.tagName === 'TEXTAREA' || domElement.tagName === 'SELECT') {
        const valStr = newValue.toString();
        if (domElement.value !== valStr) {
          domElement.value = valStr;
        }
      } else {
        domElement.setAttribute(key, newValue.toString());
      }
    } else if (typeof newValue === 'boolean' && key !== 'className') {
      if (domElement[key] !== newValue) {
        domElement[key] = newValue;
      }
      if (newValue) {
        if (!domElement.hasAttribute(key)) domElement.setAttribute(key, '');
      } else {
        if (domElement.hasAttribute(key)) domElement.removeAttribute(key);
      }
    } else {
      if (domElement.getAttribute(key) !== newValue.toString()) {
        domElement.setAttribute(key, newValue.toString());
      }
    }
  }
}


// patchChildren now takes raw new children and processed old children.
// It must return an array of newly processed children VDOM objects.
function patchChildren(parentDOMElement, newRawChildren, oldProcessedChildren) {
  const newChildrenSanitized = (newRawChildren || []).filter(c => c != null);
  const oldChildrenSanitized = (oldProcessedChildren || []).filter(c => c != null);
  const finalProcessedChildren = []; // To store the resulting processed children

  let oldStartIndex = 0;
  let newStartIndex = 0;
  let oldEndIndex = oldChildrenSanitized.length - 1;
  let newEndIndex = newChildrenSanitized.length - 1;

  let oldStartVnode = oldChildrenSanitized[oldStartIndex]; // Processed
  let newStartRawVnode = newChildrenSanitized[newStartIndex]; // Raw
  let oldEndVnode = oldChildrenSanitized[oldEndIndex]; // Processed
  let newEndRawVnode = newChildrenSanitized[newEndIndex]; // Raw

  let oldKeyToIdxMap;
  let idxInOld;
  let elmToMove; // This will be a processed VDOM node

  // This array will be built up to match the order of newRawChildren,
  // but will contain processed VDOM nodes.
  const newProcessedChildrenArray = new Array(newChildrenSanitized.length);


  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (oldStartVnode == null) { // Was moved or removed
      oldStartVnode = oldChildrenSanitized[++oldStartIndex];
    } else if (oldEndVnode == null) { // Was moved or removed
      oldEndVnode = oldChildrenSanitized[--oldEndIndex];
    } else if (newStartRawVnode == null) { // Should not happen if sanitized
      newStartRawVnode = newChildrenSanitized[++newStartIndex];
    } else if (newEndRawVnode == null) { // Should not happen if sanitized
      newEndRawVnode = newChildrenSanitized[--newEndIndex];
    } else if (areSameVnode(newStartRawVnode, oldStartVnode)) {
      const processedChild = patch(parentDOMElement, newStartRawVnode, oldStartVnode);
      newProcessedChildrenArray[newStartIndex] = processedChild;
      oldStartVnode = oldChildrenSanitized[++oldStartIndex];
      newStartRawVnode = newChildrenSanitized[++newStartIndex];
    } else if (areSameVnode(newEndRawVnode, oldEndVnode)) {
      const processedChild = patch(parentDOMElement, newEndRawVnode, oldEndVnode);
      newProcessedChildrenArray[newEndIndex] = processedChild;
      oldEndVnode = oldChildrenSanitized[--oldEndIndex];
      newEndRawVnode = newChildrenSanitized[--newEndIndex];
    } else if (areSameVnode(newEndRawVnode, oldStartVnode)) { // Vnode moved right
      const processedChild = patch(parentDOMElement, newEndRawVnode, oldStartVnode);
      newProcessedChildrenArray[newEndIndex] = processedChild;
      parentDOMElement.insertBefore(oldStartVnode.dom, oldEndVnode.dom.nextSibling);
      oldStartVnode = oldChildrenSanitized[++oldStartIndex];
      newEndRawVnode = newChildrenSanitized[--newEndIndex];
    } else if (areSameVnode(newStartRawVnode, oldEndVnode)) { // Vnode moved left
      const processedChild = patch(parentDOMElement, newStartRawVnode, oldEndVnode);
      newProcessedChildrenArray[newStartIndex] = processedChild;
      parentDOMElement.insertBefore(oldEndVnode.dom, oldStartVnode.dom);
      oldEndVnode = oldChildrenSanitized[--oldEndIndex];
      newStartRawVnode = newChildrenSanitized[++newStartIndex];
    } else { // Keys don't match, or no keys
      if (oldKeyToIdxMap === undefined) {
        oldKeyToIdxMap = createKeyToOldIdx(oldChildrenSanitized, oldStartIndex, oldEndIndex);
      }
      const key = newStartRawVnode.attrs ? newStartRawVnode.attrs.key : undefined;
      idxInOld = key !== undefined ? oldKeyToIdxMap[key] : null;

      if (idxInOld == null) { // New element
        const processedChild = patch(parentDOMElement, newStartRawVnode, null); // Creates and appends
        newProcessedChildrenArray[newStartIndex] = processedChild;
        // DOM insertion is handled by the patch call above.
        // parentDOMElement.insertBefore(processedChild.dom, oldStartVnode ? oldStartVnode.dom : null);
      } else {
        elmToMove = oldChildrenSanitized[idxInOld]; // This is a processed VDOM node
        if (!areSameVnode(newStartRawVnode, elmToMove, true /* check type only for safety */)) {
           // Key exists but type is different - treat as new element
          const processedChild = patch(parentDOMElement, newStartRawVnode, null);
          newProcessedChildrenArray[newStartIndex] = processedChild;
          // parentDOMElement.insertBefore(processedChild.dom, oldStartVnode ? oldStartVnode.dom : null);
        } else {
          const processedChild = patch(parentDOMElement, newStartRawVnode, elmToMove);
          newProcessedChildrenArray[newStartIndex] = processedChild;
          oldChildrenSanitized[idxInOld] = undefined; // Mark as processed/moved
          parentDOMElement.insertBefore(elmToMove.dom, oldStartVnode ? oldStartVnode.dom : null);
        }
      }
      newStartRawVnode = newChildrenSanitized[++newStartIndex];
    }
  }

  // Add remaining new nodes
  if (newStartIndex <= newEndIndex) {
    const referenceNode = newChildrenSanitized[newEndIndex + 1] == null ? null : (newProcessedChildrenArray[newEndIndex + 1] ? newProcessedChildrenArray[newEndIndex + 1].dom : null);
    for (let i = newStartIndex; i <= newEndIndex; ++i) {
      const rawChildToAdd = newChildrenSanitized[i];
      if (rawChildToAdd != null && newProcessedChildrenArray[i] == null) { // Check if not already processed (e.g. by key move)
         const processedChild = patch(parentDOMElement, rawChildToAdd, null); // Creates and appends
         newProcessedChildrenArray[i] = processedChild;
         // DOM insertion is handled by patch.
         // parentDOMElement.insertBefore(processedChild.dom, referenceNode);
      }
    }
  }

  // Remove remaining old nodes
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; ++i) {
      const oldChildToRemove = oldChildrenSanitized[i];
      if (oldChildToRemove != null) { // Not already moved or processed
        patch(parentDOMElement, null, oldChildToRemove); // Handles DOM removal
      }
    }
  }
  return newProcessedChildrenArray.filter(c => c != null); // Filter out any potential nulls if logic allows
}


// areSameVnode compares a rawVnode (from h()) with a processedVnode (from state)
// typeOnlyCheck is a bit of a hack for the keyed scenario where types might mismatch for same key
function areSameVnode(rawVnode, processedVnode, typeOnlyCheck = false) {
  if (rawVnode == null || processedVnode == null) return false;

  const isRawText = typeof rawVnode === 'string' || typeof rawVnode === 'number';
  const isProcessedText = processedVnode.type === '#text';

  if (isRawText && isProcessedText) return true;
  if (isRawText || isProcessedText) return false; // One is text, other is element

  // Both are element vnodes
  if (rawVnode.tag !== processedVnode.type) return false;
  if (typeOnlyCheck) return true; // Used when key matches but want to double check type

  const rawKey = rawVnode.attrs ? rawVnode.attrs.key : undefined;
  // processedVnode.key is already top-level
  return rawKey === processedVnode.key;
}

function createKeyToOldIdx(children, beginIdx, endIdx) { // children are processedVnodes
  const map = {};
  for (let i = beginIdx; i <= endIdx; ++i) {
    const child = children[i];
    if (child && child.key != null) {
      map[child.key] = i;
    }
  }
  return map;
}

// addVnodes and removeVnodes are effectively replaced by calls to patch(parent, newRaw, null) or patch(parent, null, oldProcessed)
// So, the standalone addVnodes and removeVnodes functions are no longer directly used by patchChildren in the same way.
// The DOM operations are encapsulated within the patch calls.

