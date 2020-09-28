const { expect } = require('chai');
const strongCheck = require('./password');

// list out test cases here
const testCases = [
  // failing
  ["aaaabbaaabbaaa123456A", 3],

  // passing
  ["AAAAAABBBBBB123456789a", 4],
  ["abcdefghijklmnopqrstuvwxyz", 8],
  ["aaaaaa1234567890123Ubefg", 4],
  ["ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8],
  ["ABABABABABABABABABAB1", 2],
  ["1010101010aaaB10101010", 2],
  ["Aa1Aa1Aa1Aa1Aa1Aa1zzAa1Aa1Aa1Aa1Aa1Aa1zzAa1Aa1Aa1Aa1Aa1Aa1zz", 40],
  ["aaa111", 2],
  ['aaa6734D', 1],
  ["1a8Dm0", 0],
  ["aaaaA", 1],
  ["aaaaa", 2],
  ["", 6],
  ["0123456789", 2],
  ["aaaaA", 1],
  ["aaaaa", 2],
  ["$$$", 3],
  ["aaaaaaaaaaaaaaaaaaaaa", 7],
  ["aaaaabbbbbccccccddddddA1", 8],
];

describe('strong password checker', () => {
  testCases.forEach((t) => {
    it(`check password: ${t[0]}`, () => {
      // send over string, first element in array;
      const res = strongCheck(t[0]);

      expect(res).to.equal(t[1]);
    });
  });
});
