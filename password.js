/**
 * This is an attempt at writing a more descriptive version to the solution
 * than the terse ones available on leetcode
 *
 * This solution could be more dynamic but it solves the test cases.
 * Well one is still busted, will hopefully fix soon
 * 
 */
let totalOperations;
const minLength = 6;
const maxLength = 20;
const searchOperationOrder = [
  "tooShort",
  "tooLong",
  "hasLowercase",
  "hasUppercase",
  "hasDigit",
  "hasThreeSeqChars",
];

function isStrongEnough(s) {
  let strong = true;

  for (let k = 0; k < searchOperationOrder.length; k++) {
    // if strong === false let's stop checking and take a break
    if (strong === false) {
      break;
    }

    const o = searchOperationOrder[k];
    // run through our check object functions in order
    if (check[o](s)) {
      strong = false;
    }
  }

  return strong;
}

/**
 * @param {string} s
 * @return {number}
 */
function strongPasswordChecker(s) {
  // ensure we are dealing with a string
  s = s.toString();
  // set operations to 0
  totalOperations = 0;

  // keep looping if not strong enough
  let toRun = true;
  while (isStrongEnough(s) === false && toRun !== false) {
    // run update routines based on what is needed
    toRun = figureOutWhatToRunNext(s);
    if (toRun) {
      s = replaceHelpers[toRun](s.toString());
    }
  }

  return totalOperations;
}

// create helper check object
const check = {
  tooShort(s) {
    return s.length < minLength;
  },
  tooLong(s) {
    return s.length > maxLength;
  },
  hasLowercase(s) {
    if (!s) {
      return false;
    }

    return s.match(/[a-z]/) !== null;
  },
  hasUppercase(s) {
    if (!s) {
      return false;
    }

    return s.match(/[A-Z]/) !== null;
  },
  hasDigit(s) {
    if (!s) {
      return false;
    }

    return s.match(/[0-9]/) !== null;
  },
  hasThreeSeqChars(s) {
    let hasThree = false;
    const result = this.getThreeSeqChars(s);

    // we found a dupe pattern
    if (result && result.foundChar !== false) {
      hasThree = true;
    }

    return hasThree;
  },
  hasMoreThanThreeSeqChars(s) {
    let hasMoreThanThree = false;
    const result = this.getThreeSeqChars(s);
    // we found a dupe pattern
    if (result.moreThanThreeSeqChars) {
      hasMoreThanThree = true;
    }

    return hasMoreThanThree;
  },
  getThreeSeqChars(s) {
    const strong = true;

    // find unique chars
    const chars = s
      .split("")
      .filter((value, index, self) => self.indexOf(value) === index);

    let foundChars = {};
    let boundaries = [];
    let currentIndex = 0;
    let moreThanThreeSeqChars = false;
    let matchResult;
    // iterate chars and detect lengths of more than 3
    while (currentIndex < chars.length) {
      // init pattern no need to do a global match since we just need the first
      let pattern = `${chars[currentIndex]}`;
      pattern = pattern.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      matchResult = s.match(new RegExp(`${pattern}{3,}`));

      if (matchResult && matchResult[0].length > 3) {
        moreThanThreeSeqChars = true;
      }

      // found the match
      if (Array.isArray(matchResult)) {
        const startIndex = matchResult.index;
        // use length as an index to store object
        foundChars[matchResult[0].length] = {
          // set boundaries to extract weak char string
          boundaries: [startIndex, startIndex + 2],
          foundChar:  matchResult[0][0],
          moreThanThreeSeqChars
        };
      }

      currentIndex++;
    }

    let longestSequence;
    let target = {
      boundaries: [],
      foundChar: false,
      moreThanThreeSeqChars: false
    };
    const foundKeys = Object.keys(foundChars);
    // let's return our longest sequence, if matches were found
    if (foundKeys.length > 0) {
      longestSequence = Math.max(...foundKeys);
      target = foundChars[longestSequence];
    }

    // return foundChar and boundaries
    return target;
  },
};

// this will help us save some cycles by not iterating through
// update functions for weak problems that do not exist
function figureOutWhatToRunNext(s) {
  let runThis = false;
  // the logic of adding the routines to runThese
  // is in a specific order
  //
  // you want to remove first
  // next replace
  // then lastly add characters

  // check if the string is too long. if it is, remove characters
  // remove prefers to remove sequential duplicates as opposed to random characters
  // if there are sequences of more than 3 chars...like 4, move on to replace
  if (check.tooLong(s) && !check.hasMoreThanThreeSeqChars(s)) {
    runThis = "removeChars";
  }

  if (check.tooLong(s) && check.hasMoreThanThreeSeqChars(s) && runThis === false) {
    runThis = "removeMoreThanThreeSeqChars";
  }

  // let's replace characters if any of the following conditions hit
  // ensure that there are NOT more than 3 sequential characters
  if (!check.hasMoreThanThreeSeqChars(s) &&
    (check.hasThreeSeqChars(s) ||
      !check.hasDigit(s) ||
      !check.hasUppercase(s) ||
      !check.hasLowercase(s)) &&
    s.length >= minLength &&
    s.length <= maxLength &&
    runThis === false
  ) {
    runThis = "replaceChars";
  }

  // since we want the minimum amount of changes
  // handle replacing more than 3 sequential characters in a different way
  // double check that the minimum length requirement is met
  // if it is shorter, adding characters would be more efficient
  if (check.hasMoreThanThreeSeqChars(s) && s.length >= minLength && runThis === false) {
    runThis = "replaceMoreThanThreeSeqChars";
  }

  // if the string is too short, add characters  
  if (check.tooShort(s) && runThis === false) {
    runThis = "addChars";
  }

  // console.log(runThis);

  return runThis;
}

function incrementOperation() {
  totalOperations += 1;
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

// pull a random character
// if alphabet, use unicode table for help
// https://www.rapidtables.com/code/text/unicode-characters.html
const charTypes = ["lower", "upper", "number"];
function getRandomChar(charType, s = null) {
  let char;
  let charCode;

  // if charType has not been set then choose on at random
  if (charType === false) {
    // let's be smart about what char we should pick
    if (!check.hasDigit(s)) {
      charType = "digit";
    } else if (!check.hasUppercase(s)) {
      charType = "upper";
    } else if (!check.hasLowercase(s)) {
      charType = "lower";
    } else {
      // just pick a charType at random
      charType = charTypes[randomNumber(0, charTypes.length - 1)];
    }
  }

  switch (charType) {
    // choose random lowercase
    case "lower":
      // let's pull a random lowercase
      charCode = randomNumber(97, 122);
      char = String.fromCharCode(charCode);
      break;
    // choose random uppercase
    case "upper":
      charCode = randomNumber(65, 90);
      char = String.fromCharCode(charCode);
      break;
    // choose random number
    case "digit":
      char = randomNumber(0, 9);
      break;
  }

  return char;
}

const replaceHelpers = {
  removeChars(s) {
    // if max length is larger than the string length, iterate by the string length
    // if maxLenth is smaller than the string length then substract
    let currentIndex = 0;

    // keep looping if we have not reached the byHowMuch boundary
    // and if there are more than 3 sequential characters
    // or if the string is too long
    while (check.hasThreeSeqChars(s) || check.tooLong(s)) {
      let chosenIndex;

      // prefer to remove duplicate sequential characters first
      if (check.hasThreeSeqChars(s)) {
        const foundSequence = check.getThreeSeqChars(s);
        // set the index to the right boundary for replacement
        chosenIndex = foundSequence.boundaries[1];
      } else {
        chosenIndex = currentIndex;
      }

      // let's choose a random index
      const removeChar = s[chosenIndex];
      const canRemove = areWeAbleTo.removeChar(s, chosenIndex, removeChar);

      // check if we can remove and remove it
      if (canRemove) {
        s = this.removeIndex(s, chosenIndex);
        incrementOperation();
      } else {
        // if we can't remove it let's increment the counter
        currentIndex += 1;
      }

      // console.log(canRemove, s, chosenIndex, removeChar);
    }

    return s;
  },
  addChar(s, index, char) {
    let newString = s.split("");
    newString.splice(index, 0, char);
    newString = newString.join("");

    return newString;
  },
  addChars(s) {
    let chosenIndex;

    // keep iterating until string length has been beefed up
    while ((s.length || 0) !== minLength) {
      // prefer to remove duplicate sequential characters first
      if (check.hasThreeSeqChars(s)) {
        const foundSequence = check.getThreeSeqChars(s);
        // set the index to the right boundary for replacement
        chosenIndex = foundSequence.boundaries[1];
      } else {
        chosenIndex = 0;
      }

      // get smart random character
      const addChar = getRandomChar(false, s);
      const canAdd = areWeAbleTo.addChar(s, chosenIndex, addChar);

      if (canAdd) {
        s = this.addChar(s, chosenIndex, addChar);
        incrementOperation();
      }

      // console.log(canAdd, s, addChar);
    }

    return s;
  },
  replaceChar(s, currentIndex, replaceChar) {
    // replace that one character
    s = s.split("");
    s[currentIndex] = replaceChar;
    s = s.join("");

    return s;
  },
  replaceChars(s) {
    let currentIndex = 0;

    while (
      // keep running while there are three sequential characters
      // or there is no digit
      // or there is no upper case character
      // or there is no lower case character
      check.hasThreeSeqChars(s) ||
      !check.hasDigit(s) ||
      !check.hasUppercase(s) ||
      !check.hasLowercase(s)
    ) {
      let replaceChar;

      // prefer to remove duplicate sequential characters first
      if (check.hasThreeSeqChars(s)) {
        const foundSequence = check.getThreeSeqChars(s);
        // set the index to the right boundary for replacement
        chosenIndex = foundSequence.boundaries[1];
        replaceChar = getRandomChar(false, s);
      } else if (!check.hasDigit(s)) {
        // let's add a digit
        chosenIndex = currentIndex;
        replaceChar = getRandomChar("digit");
        currentIndex++;
      } else if (!check.hasUppercase(s)) {
        chosenIndex = currentIndex;
        replaceChar = getRandomChar("upper");
        currentIndex++;
      } else if (!check.hasLowercase(s)) {
        chosenIndex = currentIndex;
        replaceChar = getRandomChar("lower");
        currentIndex++;
      }

      // let's choose a random index
      const canReplace = areWeAbleTo.replaceChar(s, chosenIndex, replaceChar);
      // check if we can remove and remove it
      if (canReplace) {
        s = this.replaceChar(s, chosenIndex, replaceChar);
        incrementOperation();
      }

      // console.log(canReplace, s, chosenIndex, replaceChar);
    }

    return s;
  },
  removeMoreThanThreeSeqChars(s) {
    let currentIndex = 0;
    let foundSequence;
    let canRemove;
    let chosenIndex;

    while (check.hasMoreThanThreeSeqChars(s) && check.tooLong(s)) {
      // check to see if we are on the last removal be smarter about it
      // meaning we remove to fix two problems
      if (s.length - maxLength === 1) {
        const foundSequence = check.getThreeSeqChars(s);
        // set the index to the right boundary for replacement
        chosenIndex = foundSequence.boundaries[1];
      } else {
        foundSequence = check.getThreeSeqChars(s);
        // set the index to the right boundary for replacement
        chosenIndex = foundSequence.boundaries[1];
      }

      // check if we can remove and remove it
      canRemove = areWeAbleTo.removeChar(s, chosenIndex);
      if (canRemove) {
        s = this.removeIndex(s, chosenIndex);
        incrementOperation();
      }

      // console.log(s);
    }

    return s;
  },
  replaceMoreThanThreeSeqChars(s) {
    while (check.hasMoreThanThreeSeqChars(s)) {
      const foundSequence = check.getThreeSeqChars(s);
      // set the index to the right boundary for replacement
      const chosenIndex = foundSequence.boundaries[1];
      const replaceChar = getRandomChar(false, s);

      // let's choose a random index
      const canReplace = areWeAbleTo.replaceChar(s, chosenIndex, replaceChar);
      // check if we can remove and remove it
      if (canReplace) {
        s = this.replaceChar(s, chosenIndex, replaceChar);
        incrementOperation();
      }
    }

    return s;
  },
  removeIndex(s, remove) {
    return s
      .split("")
      .filter((value, index) => index !== remove)
      .join("");
  },
};

function acceptStringChange(s, newString) {
  let looksGood = true;
  // check for existing problems
  let had = {
    lowercase: check.hasLowercase(s),
    uppercase: check.hasUppercase(s),
    digit: check.hasDigit(s),
  };

  // check if we are not changing anything
  if (s === newString) {
    looksGood = false;
  }

  // check if the new string introduces any new errors
  if (had.lowercase && !check.hasLowercase(newString)) {
    looksGood = false;
  }

  if (had.uppercase && !check.hasUppercase(newString)) {
    looksGood = false;
  }

  if (had.digit && !check.hasDigit(newString)) {
    looksGood = false;
  }

  return looksGood;
}

// this checks if we are able to perform the replacment operations
// without introducing changes
const areWeAbleTo = {
  addChar(s, index, char) {
    const newString = replaceHelpers.addChar(s, index, char);

    return acceptStringChange(s, newString);
  },
  removeChar(s, index) {
    const newString = replaceHelpers.removeIndex(s, index);

    return acceptStringChange(s, newString);
  },
  replaceChar(s, index, char) {
    // check to ensure that we aren't replacing the character
    // with the exact same character
    const newString = replaceHelpers.replaceChar(s, index, char);

    return acceptStringChange(s, newString);
  },
};

module.exports = strongPasswordChecker;
