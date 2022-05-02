export const debounced =  (function () {
    let timer;
    let counter;
    return (delay, fn, ...args) => {
      if (counter === undefined) {
        counter = 1;
          fn.call(...args);
          timer = setTimeout(() => counter = undefined, delay);
      } else {
        clearTimeout(timer);
        timer = setTimeout(() => {
          fn.call(...args);
          counter = undefined;
        }, delay);
      }
    };
})()