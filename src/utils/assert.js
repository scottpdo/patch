export default (bool) => {
  if (bool !== true) throw new Error("Assertion failed!");
};
