import xss from 'xss';

/**
 * Clean for xss.
 * @param {string/object} data - The value to sanitize
 * @return {string/object} The sanitized value
 */
export const clean = (data = '') => {
  let isObject = false;
  if (typeof data === 'object') {
    data = JSON.stringify(data);
    isObject = true;
  }

  data = xss(data);

  if (isObject) {
    data = JSON.parse(data);
  }

  return data;
};

/**
 * Middleware to sanitize user input against XSS.
 */
const xssSanitize = () => {
  return (req, res, next) => {
    if (req.body) req.body = clean(req.body);
    if (req.query) req.query = clean(req.query);
    if (req.params) req.params = clean(req.params);

    next();
  };
};

export default xssSanitize;
