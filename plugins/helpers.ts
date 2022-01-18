const pluralize = (word: String, count: Number, alternative = '') => count === 1 ? word : (alternative || `${word}s`);

export {
  pluralize,
};

export default (_: any, inject: Function) => {
  inject('pluralize', pluralize);
};
