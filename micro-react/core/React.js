

function createTextNode(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => {
        if (typeof child === 'string' || typeof child === 'number') {
          return createTextNode(child);
        } else {
          return child;
        }
      })
    }
  }
}

function renderV1(el, container) {
  const dom = el.type === 'TEXT_ELEMENT'
    ? document.createTextNode(el.nodeValue)
    : document.createElement(el.type);

  // 处理props
  Object.keys(el.props).forEach(key => {
    if (key !== 'children') {
      dom[key] = el.props[key];
    }
  });

  // 处理children
  const children = el.props.children;
  children.forEach(child => {
    render(child, dom)
  });

  container.append(dom);
}

let root = null;
let currentRoot = null;
let nextUnitOfWork = null;
let deletion = [];

function render(el, container) {
  root = {
    dom: container,
    props: {
      children: [el]
    }
  }
  nextUnitOfWork = root;
}

function commitRoot() {
  deletion.forEach(commitDeletion);
  commitWork(root.child);
  currentRoot = root;
  root = null;
  deletion = [];
}

function commitDeletion(fiber) {
  if (fiber.dom) {
    let fiberParent = fiber.parent;
    while (!fiberParent.dom) {
      fiberParent = fiberParent.parent;
    }
    fiberParent.dom.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child);
  }
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }

  if (fiber.effectTag === 'placement') {
    fiber?.dom && fiberParent.dom.append(fiber.dom);
  } else if (fiber.effectTag === 'update') {
    fiber?.dom && updateProps(fiber.dom, fiber.props, fiber.alternate.props);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && root) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function createDom(type) {
  return type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(type);
}

function updateProps(dom, nextProps, prevProps={}) {

  Object.keys(prevProps).forEach(key => {
    if (!(key in nextProps)) {
      dom.removeAttribute(key);
    }
  });

  Object.keys(nextProps).forEach(key => {
    if (key === 'children') return;

    if (!key.startsWith('on')){
      dom[key] = nextProps[key];
      return;
    } 
    const eventName = key.toLowerCase().substring(2);
    dom.removeEventListener(eventName, prevProps[key]);
    dom.addEventListener(eventName, nextProps[key]);
  })
}

function reconcileChildren(fiber, children) {
  let olderFiber = fiber.alternate?.child;
  let pervChild = null;

  children.forEach((child, index) => {
    const isSameType = child.type === olderFiber?.type;
    let newFiber = null;
    const { type, props } = child;
    if (isSameType) {
      newFiber = {
        type,
        props,
        parent: fiber,
        child: null,
        sibling: null,
        dom: olderFiber.dom,
        alternate: olderFiber,
        effectTag: 'update'
      }
    } else {
      if (child) {
        newFiber = {
         type,
         props,
         parent: fiber,
         child: null,
         sibling: null,
         dom: null,
         effectTag: 'placement'
       }
      }
      if (olderFiber) {
        deletion.push(olderFiber);
      }
    }
    if (olderFiber) {
      olderFiber = olderFiber.sibling;
    }
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      pervChild.sibling = newFiber;
    }
    if (newFiber) {
      pervChild = newFiber;
    }
  });

  while (olderFiber) {
    deletion.push(olderFiber);
    olderFiber = olderFiber.sibling;
  }
}

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber.type);
    updateProps(fiber.dom, fiber.props);
  }
  const children = fiber.props.children;
  reconcileChildren(fiber, children);
}

function performUnitOfWork(fiber) {
  const isFunctionComponent = typeof fiber.type === 'function';

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if( fiber.child) return fiber.child;

  let nextFiber = fiber;
  while (nextFiber) {
    if(nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent;
  }
  return undefined;
}

const update = () => {
  root = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,
  }
  nextUnitOfWork = root;
}

const React = {
  update,
  render,
  createElement
}

export default React;