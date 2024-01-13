
// V1
// const dom = document.createElement('div');
// dom.id = 'app';

// const textEl = document.createTextNode('');
// textEl.nodeValue = 'Hello, world!';

// const root = document.querySelector('#root');
// dom.append(textEl);
// root.append(dom);

// V2
// const textEl = {
//   type: 'TEXT_ELEMENT',
//   props: {
//     nodeValue: 'Hello, world!',
//     children: []
//   }
// }

// const el = {
//   type: 'div',
//   props: {
//     id: 'app',
//     children: [
//       textEl
//     ]
//   }
// }

// const dom = document.createElement(el.type);
// dom.id = el.props.id;
// document.querySelector('#root').append(dom);

// const textNode = document.createTextNode('');
// textNode.nodeValue = textEl.props.nodeValue;
// dom.append(textNode);

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
      children: children.map(child => typeof child === 'object' ? child : createTextNode(child))
    }
  }
}

const textEl = createTextNode('Hello, world!');
const App = createElement('div', { id: 'app' }, textEl);
const dom = document.createElement(App.type);
dom.id = App.props.id;
document.querySelector('#root').append(dom);

const textNode = document.createTextNode('');
textNode.nodeValue = textEl.props.nodeValue;
dom.append(textNode);