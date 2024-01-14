
let taskId = 1;
function workLoop(deadline) {
  taskId++;

  let shouldYield = false;
  while (!shouldYield) {
    // Perform work until there is no more time remaining.
    console.log(`Processing task ${taskId}`);
    shouldYield = deadline.timeRemaining() < 1;
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);