function prevent<T extends (...args: any[]) => any>(exec: T) {
  return function (event: { preventDefault: () => void }) {
    event.preventDefault();
    exec();
  };
}
