module.exports = function (fn) {
  // return is for the function to discriminate between (req, res, next)
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
