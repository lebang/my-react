import React from "./core/React.js"
import ReactDOM from "./core/ReactDom.js"

const App = React.createElement('div', { id: 'app' }, { type: 'div', props: { id: 'txt' }, children: 'hello word!' }, 'next work');
console.log('app:', App);

ReactDOM.createRoot(document.querySelector("#root")).render(App)