import React from "./core/React.js"
import ReactDOM from "./core/ReactDom.js"

const App = React.createElement('div', {id: 'app'}, 'hello word!')

ReactDOM.createRoot(document.querySelector("#root")).render(App)