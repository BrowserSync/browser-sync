console.log("before")
await new Promise(resolve => setTimeout(resolve, 1000));
console.log("after")
