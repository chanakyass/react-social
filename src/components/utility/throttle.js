export function throttleTheFunction(delay, fn, ...args) {
    let timer;
    return () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn(...args);
        }, delay);
    }
}