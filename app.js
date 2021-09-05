const prompt = require('prompt-sync')();
const parse = require('csv-parse');
const fs = require('fs');

const isAlphabet = /^[a-zA-Z]+$/;

let letter = [];
let letterCount = [];

let name1 = prompt('What is your name1?');

console.log(isAlphabet.test(name1));
while (!isAlphabet.test(name1)) {
  console.log('Please enter alphabets only');
  name1 = prompt('What is your name1?');
}
let name2 = prompt('What is your name2?');
while (!isAlphabet.test(name2)) {
  console.log('Please enter alphabets only');
  name2 = prompt('What is your name2?');
}
const sentence = `${name1} matches ${name2}`;
countLetter(sentence.replace(/\s/g, ''));
const matchPerc = matchPercentage(letterCount);
if (matchPerc > 80) {
  console.log(sentence + matchPerc + ' %, good match');
} else {
  console.log(sentence + matchPerc + ' %');
}
console.log();
function countLetter(sentence) {
  letter = [];
  letterCount = [];
  for (let i = 0; i < sentence.length; i++) {
    letter.push(sentence.charAt(i).toLowerCase());
  }

  while (letter.length != 0) {
    let countLength = letter.length;
    let firstLetter = letter[0];
    letter = letter.filter((let) => {
      return let !== firstLetter;
    });

    letterCount.push(countLength - letter.length);
  }
}

function matchPercentage(countLetter) {
  let newSum = [];
  for (let i = 0; i < countLetter.length; i++) {
    if (i > countLetter.length - 1 - i) {
      break;
    }
    if (i === countLetter.length - 1 - i) {
      newSum.push(countLetter[i]);
      break;
    } else {
      let num = countLetter[i] + countLetter[countLetter.length - 1 - i];
      if (num > 9) {
        newSum.push(parseInt(num.toString().charAt(0)));
        newSum.push(parseInt(num.toString().charAt(1)));
      } else {
        newSum.push(num);
      }
    }
  }

  if (parseInt(newSum.join('')) <= 100) {
    return parseInt(newSum.join(''));
  } else {
    return matchPercentage(newSum);
  }
}

let csv = prompt('Enter csv name?');

let males = [];
let females = [];
let textFileResult = [];

const data = [];

try {
  fs.createReadStream(csv + '.csv')
    .pipe(parse({ delimiter: ',' }))
    .on('data', (r) => {
      data.push(r);
    })
    .on('end', () => {
      for (let i = 0; i < data.length; i++) {
        const gender = data[i][1].trim();
        const personName = data[i][0];

        if (gender.toLowerCase() === 'f' && !females.includes(personName)) {
          females.push(personName);
        } else if (
          gender.toLowerCase() === 'm' &&
          !males.includes(personName)
        ) {
          males.push(personName);
        }
      }

      females.forEach((female) => {
        males.forEach((male) => {
          let sentence = female + ' matches ' + male;
          let sentenceBuilder = (female + 'matches' + male).replace(/\s/g, '');
          countLetter(sentenceBuilder);
          textFileResult.push([sentence, matchPercentage(letterCount)]);
        });
      });

      textFileResult = textFileResult.sort(function (a, b) {
        return b[1] - a[1];
      });

      let finalSort = [];
      let commonPercentage = [];
      let commonPerc = 0;

      textFileResult.forEach((res) => {
        if (commonPercentage.length === 0) {
          commonPercentage.push(res);
          commonPerc = res[1];
        } else if (commonPerc === res[1]) {
          commonPercentage.push(res);
        } else if (commonPerc !== res[1]) {
          if (commonPercentage.length > 1) {
            commonPercentage = commonPercentage.sort(function (a, b) {
              return a[0].localeCompare(b[0]);
            });
            commonPercentage.forEach((response) => {
              finalSort.push(response);
            });
          } else {
            commonPercentage.forEach((response) => {
              finalSort.push(response);
            });
          }
          commonPercentage = [];
          commonPerc = res[1];
          commonPercentage.push(res);
        }
      });

      if (commonPercentage.length > 1) {
        commonPercentage = commonPercentage.sort(function (a, b) {
          return a[0].localeCompare(b[0]);
        });

        commonPercentage.forEach((response) => {
          finalSort.push(response);
        });
      }

      var stream = fs.createWriteStream('output.txt');
      stream.once('open', function (fd) {
        finalSort.forEach((res) => {
          if (res[1] > 80) {
            stream.write(res[0] + ' ' + res[1] + '%, good match' + '\n');
          } else {
            stream.write(res[0] + ' ' + res[1] + '%\n');
          }
        });
        console.log('Successfuly stored in textfile:)')
      });
    });
} catch (error) {
  console.log('test');
}

process.on('uncaughtException', function (err) {
    console.log("File does not exist in project. Please add.");
  });