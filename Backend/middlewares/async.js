const catchAsync = (func) => (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch(next);
};

export default catchAsync;
// This middleware wraps async functions to handle errors properly in Express.js
// It catches any errors thrown in the async function and passes them to the next middleware (error handler).   