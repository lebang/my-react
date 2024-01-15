import React from "./core/React";


function Counter({num}) {
  return <div>hello counter: {num}</div>;
}

function Container() {
  return <div>
    <div>aa</div>
    hello wrapper
    <Counter num={10}/>
    <Counter num={20}/>
  </div>
}

const App = <div>hello world
  <Container />
</div>;

export default App;