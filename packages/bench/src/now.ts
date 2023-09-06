// eslint-disable-next-line import/no-mutable-exports
let now = () => {
  return Date.now();
};

if (typeof preciseTime === 'function') {
  now = () => {
    return preciseTime() * 1000;
  };
}

export { now };
