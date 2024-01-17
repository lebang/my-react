

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
  commitWork(root.child);
  currentRoot = root;
  root = null;
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

  // if (fiber.dom) {
  //   fiberParent.dom.append(fiber.dom);
  // }
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
    if (key !== 'children') {
      if (key.startsWith('on')){
        const eventName = key.toLowerCase().substring(2);
        dom.removeEventListener(eventName, prevProps[key]);
        dom.addEventListener(eventName, nextProps[key]);
      } else {
        dom[key] = nextProps[key];
      }
    }
  })

  // Object.keys(nextProps).forEach(key => {
  //   if (key !== 'children') {
  //     if (key.startsWith('on')){
  //       const eventName = key.toLowerCase().substring(2);
  //       dom.addEventListener(eventName, nextProps[key]);
  //     } else {
  //       dom[key] = nextProps[key];
  //     }
  //   }
  // })
}

function initChildren(fiber, children) {
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
        dom: olderFiber.dom,
        child: null,
        sibling: null,
        alternate: olderFiber,
        effectTag: 'update'
      }
    } else {
       newFiber = {
        type,
        props,
        parent: fiber,
        dom: null,
        child: null,
        sibling: null,
        effectTag: 'placement'
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
    pervChild = newFiber;
  })
}

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)];
  initChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber.type);
    updateProps(fiber.dom, fiber.props);
  }
  const children = fiber.props.children;
  initChildren(fiber, children);
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