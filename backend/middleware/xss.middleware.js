import xss from 'xss';

/**
 * Deep recursive clean for XSS strings, preserving structures like objects/arrays.
 * @param {any} data - The value to sanitize recursively
 * @return {any} The sanitized value
 */
export const clean = (data) => {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return xss(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => clean(item));
  }

  if (typeof data === 'object') {
    const cleanObj = {};
    for (const key of Object.keys(data)) {
      const cleanKey = xss(key);
      cleanObj[cleanKey] = clean(data[key]);
    }
    return cleanObj;
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
