import millify from "millify";
import pluralize from "pluralize";
import sanitizeHtml from "sanitize-html";

const filters = {
  toPrecision(number, precision = 4) {
    return toPrecision(number, precision);
  },
  truncate(str, length = 100) {
    str = String(str);
    if (str.length > length) {
      return str.slice(0, length) + '...';
    }
    return str;
  },
  pluralize(str, count) {
    let pluralized = pluralize(str, count);
    fixedCaseWords.map(word => {
      if (pluralized === word.toLowerCase()) {
        pluralized = word;
      }
    })
    return pluralized;
  },
  capitalize(str) {
    if (typeof str !== "string") { return str; }
    const firstLetter = str[0];
    return firstLetter.toUpperCase() + str.substring(1);
  },
  titleCase(str) {
    if (typeof str !== "string") return str;
    const fixedWordsMap = fixedCaseWords.reduce((map, word) => {
      map[word.toLowerCase()] = word;
      return map;
    }, {});
    return str
      .split(" ")
      .map((word, index) => {
        const lowerCaseWord = word.toLowerCase();
        if (fixedWordsMap[lowerCaseWord]) {
          return fixedWordsMap[lowerCaseWord];
        }
        if (index === 0 || !stopWords.includes(lowerCaseWord)) {
          return word[0].toUpperCase() + word.slice(1).toLowerCase();
        }
        return lowerCaseWord;
      })
      .join(" ");
  },
  prettyName(name) {
    let ret = name
      .replace("ieee", "IEEE")
      .replace("United States of America", "United States")
      .replace("United Kingdom of Great Britain and Northern Ireland", "United Kingdom");
    const typeRe = /[a-z]+-[a-z]+/;
    if (typeRe.test(ret)) { ret = ret.replace("-", " "); }
    return ret;
  },
  prettyTitle(title, facetKey) {
    if (!title) return "Untitled"
    if (/^\s+$/.test(title)) return "Untitled"
    if (title && title.toUpperCase() === title) {
        title = this.titleCase(title.toLowerCase());
    }
    if (facetKey && facetKey === "type") {
        title = title.replace("-", " ")
        title = this.titleCase(title)
    }
    if (facetKey === "authorships.institutions.country_code") {
        title = title
            .replace("ieee", "IEEE")
            .replace("United States of America", "United States")
            .replace("United Kingdom of Great Britain and Northern Ireland", "United Kingdom")
    }

    const safeTitle = sanitizeHtml(title, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a'],
    })
    return safeTitle
  },
  idApiUrl(fullId) {
    if (!fullId) { return; }
    const shortId = fullId.replace("https://openalex.org/", "");
    return `https://api.openalex.org/${shortId}`;
  },
  millify(number) {
    return millify(
      number,
      {
        precision: 0,
        lowercase: false,
      }
    );
  },
};

const stopWords = [
  "a", "an", "and", "as", "at", "but", "by", "for", "in",
  "nor", "of", "on", "or", "so", "the", "to", "up", "yet"
];
const fixedCaseWords = [
  "OpenAlex", "ID", "IDs", "ROR", "ORCID", "DOI", "OA", "ISSN", "ISSNs",
  "DOAJ", "SDG", "SDGs", "FWCI", "URL", "CrossRef"
];

/**
 * Format number to significant digits.
 * https://stackoverflow.com/a/58494899
 *
 * @param {Number} number
 * @param {Number} precision
 *
 * @return {String} formattedValue
 */
const toPrecision = function (number, precision) {
  function round(precision, number) {
      return parseFloat(number.toPrecision(precision))
  }

  if (typeof number === 'undefined' || number === null) return ''

  if (number === 0) return '0'
  if (typeof number === 'string') number = parseFloat(number);

  const roundedValue = round(precision, number)
  const floorValue = Math.floor(roundedValue)

  const isInteger = Math.abs(floorValue - roundedValue) < Number.EPSILON

  const numberOfFloorDigits = String(floorValue).length
  const numberOfDigits = String(roundedValue).length

  if (numberOfFloorDigits > precision) {
      return floorValue.toLocaleString()
  } else {
      const padding = isInteger ? precision - numberOfFloorDigits : precision - numberOfDigits + 1

      if (padding > 0) {
          let ret
          if (isInteger) {
              ret = `${String(floorValue)}.${'0'.repeat(padding)}`
          } else {
              ret = `${String(roundedValue)}${'0'.repeat(padding)}`
          }
          return parseFloat(ret).toLocaleString()
      } else {
          return roundedValue.toLocaleString()
      }
  }
}

export default filters;