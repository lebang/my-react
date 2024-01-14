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
        if (typeof child === 'string') {
          return createTextNode(child);
        } else {
          return createElement(child.type, child.props, ...child.children);
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

let nextUnitOfWork = null;

function render(el, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [el]
    }
  }
  console.log('next unit:', nextUnitOfWork);
}

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function createDom(type) {
  return type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(type);
}

function updateProps(dom, props) {
  Object.keys(props).forEach(key => {
    if (key !== 'children') {
      dom[key] = props[key];
    }
  })
}

function initChildren(fiber) {
  let pervChild = null;

  const { children } = fiber.props;
  children.forEach((child, index) => {
    const { type, props } = child;
    const newFiber = {
      type,
      props,
      parent: fiber,
      dom: null,
      child: null,
      sibling: null
    }
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      pervChild.sibling = newFiber;
    }
    pervChild = newFiber;
  })
}

function performUnitOfWork(fiber) {
  // 创建DOM
  if (!fiber.dom) {
    fiber.dom = createDom(fiber.type);
    fiber.parent.dom.append(fiber.dom);
    updateProps(fiber.dom, fiber.props);
  }

  initChildren(fiber);

  return fiber?.child || fiber?.sibling || fiber.parent?.sibling;
}

const React = {
  render,
  createElement
}

export default React;