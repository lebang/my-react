import React from "./core/React";

let num = 10;
function Counter({}) {
  return <div>hello counter: {num}
  <button onClick={() => {
    num++;
    React.update(); // 通知react更新
    console.log('num:', num)
  }}>click</button>
  </div>;
}

function Container() {
  return <div>
    <div>aa</div>
    hello wrapper
    <Counter num={num}/>
    <Counter num={20}/>
  </div>
}

const App = <div>hello world
  <Container />
</div>;

export default App;