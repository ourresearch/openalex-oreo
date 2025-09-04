
const getTestValue = (test, doc, matches, source) => {
  if (test.key in matches["_test_values"]) {
    return matches["_test_values"][test.key][source];
  }
  return getFieldValue(doc, test.field);
};

const getFieldValue = (obj, field) => {
  if (!obj) { return undefined; }
  if (!field) { console.trace();return undefined; }

  const keys = field.split(".");
  let value = obj;
  for (let i = 0; i < keys.length; i++) {
    value = value !== null && typeof value === "object" ? value[keys[i]] : undefined;
    if (value === undefined) {
      return undefined;
    }
  }
  return value;
};

const getShortValue = (value, test) => {
  if (Array.isArray(value)) {
    return value.length > 0 ? `[${value.length} items]` : "[]";
  } else if (typeof value === 'object' && value !== null) {
    return `{${Object.keys(value).length} keys}`;
  } else {
    return displayValue(value, test);
  }
}

const displayValue = (value, test) => {
  if (value === undefined) {
    return "missing";
  }
  if (value === null) {
    return "null";
  }
  
  if (typeof value === 'string' && value.includes("https://openalex.org/")) {
    return value.replace("https://openalex.org/", "");
  }

  if (typeof value === 'number' && !test.key.includes("year")) {
    return value.toLocaleString();
  }

  if (Array.isArray(value)) {
    return JSON.stringify(value, null, 2)
  }
  return value;
};

function isObject(obj) {
  if (Array.isArray(obj)) {
    return true;
  } else if (typeof obj === 'object' && obj !== null) {
    return true;
  } else {
    return false;
  }
}

export { 
  getTestValue, 
  getFieldValue, 
  getShortValue, 
  displayValue, 
  isObject,
};