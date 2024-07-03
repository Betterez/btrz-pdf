function Keys(engine) {
  this.registerFilter("keys", (value) => {
    return Object.keys(value);
  })
}

module.exports = {
  Keys
};


