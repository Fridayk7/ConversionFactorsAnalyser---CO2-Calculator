/// <reference lib="webworker" />

// Knowledge graph comparison algorithm
function compareDataSets(data1: any, data2: any) {
  // Initialize similarity algorithms
  var stringSimilarity = require('string-similarity');
  let cosineSimilarity = (str1, str2) => {
    return cosdis(word2vec(str1), word2vec(str2));
  };

  let similarCFs = [];
  let counter = 0;
  // Function that compares the tags of conversion factors and produses the aberage score
  // Returns an array [is it similar/identical, similarity value, is it identical]
  let compareTags = (name1, name2, tags1, tags2, method) => {
    if (
      (tags1.length === 1 && tags1[0] === '') ||
      (tags2.length === 1 && tags2[0] == '')
    ) {
      return [true, 1, true];
    }
    for (let i = 0; i < tags1.length; i++) {
      for (let j = 0; j < tags2.length; j++) {
        if (method === 'dice' && tags1[i] != 'Fuels' && tags2[j] != 'Fuels') {
          let similarity = stringSimilarity.compareTwoStrings(
            tags1[i],
            tags2[j]
          );
          let similarity2 = stringSimilarity.compareTwoStrings(name1, tags2[j]);
          let similarity3 = stringSimilarity.compareTwoStrings(tags1[i], name2);

          if (similarity >= 0.5) {
            // If tags are not similar, consider the names as well
            return [true, similarity, true];
          } else if (similarity2 >= 0.5) {
            return [true, similarity2, false];
          } else if (similarity3 >= 0.5) {
            return [true, similarity3, false];
          }
        }
        if (method === 'cosine' && tags1[i] != 'Fuels' && tags2[j] != 'Fuels') {
          let similarity = cosineSimilarity(tags1[i], tags2[j]);
          let similarity2 = cosineSimilarity(name1, tags2[j]);
          let similarity3 = cosineSimilarity(tags1[i], name2);
          if (similarity >= 0.7) {
            return [true, similarity, true];
          } else if (similarity2 >= 0.7) {
            return [true, similarity2, false];
          } else if (similarity3 >= 0.7) {
            return [true, similarity3, false];
          }
        }
        if (method === 'naive' && tags1[i] != 'Fuels' && tags2[j] != 'Fuels') {
          if (tags1[i].toLowerCase() === tags2[j].toLowerCase()) {
            return [true, 0, true];
          }
        }
      }
    }
    return [false, 0];
  };

  for (let i of data1) {
    for (let j of data2) {
      counter += 1;
      let tempSimilarCFs = {
        cf1: '',
        cf1su: '',
        cf1tu: '',
        cf1excludeSU: false,
        cf2name: j.lookUpNames.value,
        cf2: '',
        cf2su: '',
        cf2tu: '',
        cf1date: '',
        cf1value: '',
        cf1similarityValue: 0,
        dice: {},
        cosine: {},
        naive: {},
        tagsConsidered: true,
      };
      tempSimilarCFs.dice['title'] = 'Dice Similarity';
      tempSimilarCFs.cosine['title'] = 'Cosine Similarity';
      tempSimilarCFs.naive['title'] = 'Naive String Comparisson';

      // Compare Names

      let diceNameCompare = stringSimilarity.compareTwoStrings(
        i.lookUpNames.value,
        j.lookUpNames.value
      );

      // Compare target units
      let diceTargetUnitCompare = stringSimilarity.compareTwoStrings(
        i.targetUnitNames.value,
        j.targetUnitNames.value
      );
      // Compare source units

      let diceSourceUnitCompare = stringSimilarity.compareTwoStrings(
        i.sourceUnitNames.value,
        j.sourceUnitNames.value
      );
      // Compare tags units

      let diceTagsCompare = compareTags(
        i.lookUpNames.value,
        j.lookUpNames.value,
        i.tagNames.value.split(','),
        j.tagNames.value.split(','),
        'dice'
      );
      // Check threshold

      if (
        diceNameCompare >= 0.7 &&
        diceTargetUnitCompare >= 0.9 &&
        diceTagsCompare[0]
      ) {
        tempSimilarCFs.cf1 = i.lookUpNames.value;
        tempSimilarCFs.cf1su = i.sourceUnitNames.value;
        tempSimilarCFs.cf1tu = i.targetUnitNames.value;
        tempSimilarCFs.cf1date = i.endDate.value;
        tempSimilarCFs.cf1value = i.values.value;
        tempSimilarCFs.cf2 = j.lookUpNames.value;
        tempSimilarCFs.cf2su = j.sourceUnitNames.value;
        tempSimilarCFs.cf2tu = j.targetUnitNames.value;
        tempSimilarCFs.tagsConsidered = diceTagsCompare[2];
        // Check is source unit is classified as identical
        if (diceSourceUnitCompare > 0.9) {
          tempSimilarCFs.dice['cf1'] = {
            name: i.lookUpNames.value,
            sourceUnit: i.sourceUnitNames.value,
            targetUnit: i.targetUnitNames.value,
            publisher: 'EPA',
          };
          tempSimilarCFs.dice['cf2'] = {
            name: j.lookUpNames.value,
            sourceUnit: j.sourceUnitNames.value,
            targetUnit: j.targetUnitNames.value,
            publisher: 'BEIS',
          };
          // Flag conversion factor as identical

          tempSimilarCFs.dice['similarity'] =
            (diceNameCompare +
              diceTargetUnitCompare +
              diceSourceUnitCompare +
              diceTagsCompare[1]) /
            4;
          if (
            tempSimilarCFs.cf1similarityValue <
            tempSimilarCFs.dice['similarity']
          ) {
            tempSimilarCFs.cf1similarityValue =
              tempSimilarCFs.dice['similarity'];
          }
          tempSimilarCFs.dice['excludeSU'] = false;
        } else {
          tempSimilarCFs.dice['cf1'] = {
            name: i.lookUpNames.value,
            sourceUnit: i.sourceUnitNames.value,
            targetUnit: i.targetUnitNames.value,
            publisher: 'EPA',
          };
          tempSimilarCFs.dice['cf2'] = {
            name: j.lookUpNames.value,
            sourceUnit: j.sourceUnitNames.value,
            targetUnit: j.targetUnitNames.value,
            publisher: 'BEIS',
          };
          // Flag conversion factor as similar
          tempSimilarCFs.dice['similarity'] =
            (diceNameCompare + diceTargetUnitCompare + diceTagsCompare[1]) / 3;
          tempSimilarCFs.dice['excludeSU'] = true;
          tempSimilarCFs.cf1excludeSU = true;
        }
      }

      let cosineNameCompare = cosineSimilarity(
        i.lookUpNames.value,
        j.lookUpNames.value
      );
      let cosineTargetUnitCompare = cosineSimilarity(
        i.targetUnitNames.value,
        j.targetUnitNames.value
      );

      let cosineSourceUnitCompare = cosineSimilarity(
        i.sourceUnitNames.value,
        j.sourceUnitNames.value
      );

      let cosineTagsCompare: any = compareTags(
        i.lookUpNames.value,
        j.lookUpNames.value,
        i.tagNames.value.split(','),
        j.tagNames.value.split(','),
        'cosine'
      );

      if (
        cosineNameCompare >= 0.92 &&
        cosineTargetUnitCompare >= 0.93 &&
        cosineTagsCompare[0]
      ) {
        tempSimilarCFs.cf1 = i.lookUpNames.value;
        tempSimilarCFs.cf1su = i.sourceUnitNames.value;
        tempSimilarCFs.cf1tu = i.targetUnitNames.value;
        tempSimilarCFs.cf2 = j.lookUpNames.value;
        tempSimilarCFs.cf2su = j.sourceUnitNames.value;
        tempSimilarCFs.cf2tu = j.targetUnitNames.value;
        tempSimilarCFs.cf1date = i.endDate.value;
        tempSimilarCFs.cf1value = i.values.value;
        tempSimilarCFs.tagsConsidered = cosineTagsCompare[2];

        if (cosineSourceUnitCompare >= 0.9) {
          tempSimilarCFs.cosine['cf1'] = {
            name: i.lookUpNames.value,
            sourceUnit: i.sourceUnitNames.value,
            targetUnit: i.targetUnitNames.value,
            publisher: 'EPA',
          };
          tempSimilarCFs.cosine['cf2'] = {
            name: j.lookUpNames.value,
            sourceUnit: j.sourceUnitNames.value,
            targetUnit: j.targetUnitNames.value,
            publisher: 'BEIS',
          };
          tempSimilarCFs.cosine['similarity'] =
            (cosineNameCompare +
              cosineTargetUnitCompare +
              cosineSourceUnitCompare +
              cosineTagsCompare[1]) /
            4;
          if (
            tempSimilarCFs.cf1similarityValue <
            tempSimilarCFs.cosine['similarity']
          ) {
            tempSimilarCFs.cf1similarityValue =
              tempSimilarCFs.cosine['similarity'];
          }
          tempSimilarCFs.cosine['excludeSU'] = false;
        } else {
          tempSimilarCFs.cosine['cf1'] = {
            name: i.lookUpNames.value,
            sourceUnit: i.sourceUnitNames.value,
            targetUnit: i.targetUnitNames.value,
            publisher: 'EPA',
          };
          tempSimilarCFs.cosine['cf2'] = {
            name: j.lookUpNames.value,
            sourceUnit: j.sourceUnitNames.value,
            targetUnit: j.targetUnitNames.value,
            publisher: 'BEIS',
          };
          tempSimilarCFs.cosine['similarity'] =
            (cosineNameCompare +
              cosineTargetUnitCompare +
              cosineTagsCompare[1]) /
            3;
          tempSimilarCFs.cosine['excludeSU'] = true;
          tempSimilarCFs.cf1excludeSU = true;
        }
      }

      let naiveTagsCompare = compareTags(
        i.lookUpNames.value,
        j.lookUpNames.value,
        i.tagNames.value.split(','),
        j.tagNames.value.split(','),
        'naive'
      );
      if (
        i.lookUpNames.value.toLowerCase() ===
          j.lookUpNames.value.toLowerCase() &&
        i.targetUnitNames.value.toLowerCase() ===
          j.targetUnitNames.value.toLowerCase() &&
        naiveTagsCompare[0]
      ) {
        tempSimilarCFs.cf1 = i.lookUpNames.value;
        tempSimilarCFs.cf1su = i.sourceUnitNames.value;
        tempSimilarCFs.cf1tu = i.targetUnitNames.value;
        tempSimilarCFs.cf2 = j.lookUpNames.value;
        tempSimilarCFs.cf2su = j.sourceUnitNames.value;
        tempSimilarCFs.cf2tu = j.targetUnitNames.value;
        tempSimilarCFs.cf1date = i.endDate.value;
        tempSimilarCFs.cf1value = i.values.value;
        tempSimilarCFs.tagsConsidered = naiveTagsCompare[2];

        if (
          i.sourceUnitNames.value.toLowerCase() ===
          j.sourceUnitNames.value.toLowerCase()
        ) {
          tempSimilarCFs.naive['cf1'] = {
            name: i.lookUpNames.value,
            sourceUnit: i.sourceUnitNames.value,
            targetUnit: i.targetUnitNames.value,
            publisher: 'EPA',
          };
          tempSimilarCFs.naive['cf2'] = {
            name: j.lookUpNames.value,
            sourceUnit: j.sourceUnitNames.value,
            targetUnit: j.targetUnitNames.value,
            publisher: 'BEIS',
          };
          tempSimilarCFs.naive['similarity'] = 1;
          tempSimilarCFs.naive['excludeSU'] = false;
          tempSimilarCFs.cf1similarityValue = 1;
        } else {
          tempSimilarCFs.naive['cf1'] = {
            name: i.lookUpNames.value,
            sourceUnit: i.sourceUnitNames.value,
            targetUnit: i.targetUnitNames.value,
            publisher: 'EPA',
          };
          tempSimilarCFs.naive['cf2'] = {
            name: j.lookUpNames.value,
            sourceUnit: j.sourceUnitNames.value,
            targetUnit: j.targetUnitNames.value,
            publisher: 'BEIS',
          };
          tempSimilarCFs.naive['similarity'] = 1;
          if (
            tempSimilarCFs.cf1similarityValue <
            tempSimilarCFs.naive['similarity']
          ) {
            tempSimilarCFs.cf1similarityValue =
              tempSimilarCFs.naive['similarity'];
          }
          tempSimilarCFs.naive['excludeSU'] = true;
          tempSimilarCFs.cf1excludeSU = true;
        }
      }
      if (
        Object.keys(tempSimilarCFs.dice).length > 1 ||
        Object.keys(tempSimilarCFs.cosine).length > 1 ||
        Object.keys(tempSimilarCFs.naive).length > 1
      ) {
        similarCFs.push(tempSimilarCFs);
      }
    }
  }
  return similarCFs;
}

function sortByName(data: any) {
  data.sort((a: any, b: any) =>
    b.lookUpNames.value.localeCompare(a.lookUpNames.value)
  );
  return data;
}

function sortByDate(data: any) {
  return data
    .sort(function (a: any, b: any) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return b.endDate.value - a.endDate.value;
    })
    .reverse();
}

function groupSimilarTags(data: any) {
  data = sortByDate(data);
  // `data` is an array of objects, `key` is the key (or property accessor) to group by
  // reduce runs this anonymous function on each element of `data` (the `item` parameter,
  // returning the `storage` parameter at the end
  let storage = data.reduce(function (storage: any, item: any) {
    // get the first instance of the key by which we're grouping
    for (let i of item.tagNames.value.split(',')) {
      var group = i.trimStart();

      // set `storage` for this instance of group to the outer scope (if not empty) or initialize it
      storage[group] = storage[group] || [];

      // add this item to its group within `storage`
      storage[group].push(item);
    }

    // return the updated storage to the reduce function, which will then loop through the next
    return storage;
  }, {}); // {} is the initial value of the storage

  for (let i in storage) {
    storage[i] = groupSimilar(storage[i]);
  }

  return storage;
}
function groupSimilar(data: any) {
  // `data` is an array of objects, `key` is the key (or property accessor) to group by
  // reduce runs this anonymous function on each element of `data` (the `item` parameter,
  // returning the `storage` parameter at the end
  return data.reduce(function (storage: any, item: any) {
    // get the first instance of the key by which we're grouping
    var group = `${item.lookUpNames.value}+${item.sourceUnitNames.value}+${item.targetUnitNames.value}`;
    if (item.comments) {
      group += `+${item.comments.value}`;
    }

    // set `storage` for this instance of group to the outer scope (if not empty) or initialize it
    storage[group] = storage[group] || [];

    // add this item to its group within `storage`
    storage[group].push(item.values.value ? +item.values.value : '');

    // return the updated storage to the reduce function, which will then loop through the next
    return storage;
  }, {}); // {} is the initial value of the storage
}

addEventListener('message', ({ data }) => {
  // Handle web worker requests from different components and call the correct functions
  console.log(data);
  if (data.length === 2) {
    console.log('IN1');
    const response = { results: compareDataSets(data[0], data[1]) };
    postMessage(response);
  }
  if (data.length === 1) {
    console.log('IN2');
    const response = { results: groupSimilarTags(data[0]) };
    postMessage(response);
  }
  if (data.length === 3) {
    console.log('IN3');
    const response = { results: sortByName(data[0]) };
    postMessage(response);
  }
  if (data.length === 4) {
    console.log('IN4');
    const response = { results: groupSimilar(data[0]) };
    postMessage(response);
  }
});

// Count char occurences in a string
function counter(str) {
  return str.split('').reduce((total, letter) => {
    total[letter] ? total[letter]++ : (total[letter] = 1);
    return total;
  }, {});
}

// Transform strings to vectors
function word2vec(word) {
  let charFreq = counter(word);

  let charSet = new Set(Object.keys(charFreq));

  let powerArray = [];
  for (let i in charFreq) {
    powerArray.push(charFreq[i] * charFreq[i]);
  }
  let lengthw = Math.sqrt(powerArray.reduce((a, b) => a + b, 0));

  return [charFreq, charSet, lengthw];
}

// Cosine similarity
function cosdis(v1, v2) {
  let commonLetters = new Set([...v1[1]].filter((x) => v2[1].has(x)));

  let numeratorArray = [];

  for (let i of commonLetters) {
    numeratorArray.push(v1[0][i] * v2[0][i]);
  }

  return numeratorArray.reduce((a, b) => a + b, 0) / v1[2] / v2[2];
}
