export const debounced =  (function () {
    let timer;
    let counter;
    return (delay, fn, ...args) => {
      if (counter === undefined) {
        counter = 1;
          fn(...args);
          timer = setTimeout(() => counter = undefined, delay);
      } else {
        clearTimeout(timer);
        timer = setTimeout(() => {
          fn(...args);
          counter = undefined;
        }, delay);
      }
    };
})()