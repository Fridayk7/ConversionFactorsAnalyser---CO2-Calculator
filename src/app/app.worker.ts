/// <reference lib="webworker" />

function compareDataSets(data1: any, data2: any) {
  var stringSimilarity = require('string-similarity');
  let cosineSimilarity = (str1, str2) => {
    return cosdis(word2vec(str1), word2vec(str2));
  };
  console.log(
    cosineSimilarity('Distillate Fuel Oil No. 4', 'Residual Fuel Oil No. 4'),
    stringSimilarity.compareTwoStrings('Natural gas', 'Natural Gas')
  );
  let similarCFs = [];
  let counter = 0;

  let compareTags = (tags1, tags2, method) => {
    let similarityarray = [];
    for (let i = 0; i < tags1.length; i++) {
      for (let j = 0; j < tags2.length; j++) {
        if (method === 'dice' && tags1[i] != 'Fuels' && tags2[j] != 'Fuels') {
          let similarity = stringSimilarity.compareTwoStrings(
            tags1[i],
            tags2[j]
          );

          if (similarity >= 0.7) {
            return [true, similarity];
          }
        }
        if (method === 'cosine' && tags1[i] != 'Fuels' && tags2[j] != 'Fuels') {
          let similarity = cosineSimilarity(tags1[i], tags2[j]);
          if (similarity >= 0.7) {
            return [true, similarity];
          }
        }
        if (method === 'naive' && tags1[i] != 'Fuels' && tags2[j] != 'Fuels') {
          if (tags1[i].toLowerCase() === tags2[j].toLowerCase()) {
            return [true, 0];
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
        cf2: '',
        dice: {},
        cosine: {},
        naive: {},
      };
      tempSimilarCFs.dice['title'] = 'Dice Similarity';
      tempSimilarCFs.cosine['title'] = 'Cosine Similarity';
      tempSimilarCFs.naive['title'] = 'Naive String Comparisson';

      let diceNameCompare = stringSimilarity.compareTwoStrings(
        i.lookUpNames.value,
        j.lookUpNames.value
      );
      let diceTargetUnitCompare = stringSimilarity.compareTwoStrings(
        i.targetUnitNames.value,
        j.targetUnitNames.value
      );

      let diceSourceUnitCompare = stringSimilarity.compareTwoStrings(
        i.sourceUnitNames.value,
        j.sourceUnitNames.value
      );

      let diceTagsCompare = compareTags(
        i.tagNames.value.split(','),
        j.tagNames.value.split(','),
        'dice'
      );
      if (
        diceNameCompare >= 0.7 &&
        diceTargetUnitCompare >= 0.9 &&
        diceTagsCompare[0]
      ) {
        tempSimilarCFs.cf1 = i.lookUpNames.value;
        tempSimilarCFs.cf2 = j.lookUpNames.value;

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
          tempSimilarCFs.dice['similarity'] =
            (diceNameCompare +
              diceTargetUnitCompare +
              diceSourceUnitCompare +
              diceTagsCompare[1]) /
            4;
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
          tempSimilarCFs.dice['similarity'] =
            (diceNameCompare + diceTargetUnitCompare + diceTagsCompare[1]) / 3;
          tempSimilarCFs.dice['excludeSU'] = true;
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
        tempSimilarCFs.cf2 = j.lookUpNames.value;
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
        }
      }

      let naiveTagsCompare = compareTags(
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
        tempSimilarCFs.cf2 = j.lookUpNames.value;
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
          tempSimilarCFs.naive['excludeSU'] = true;
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
  console.log('DONE');
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

    // set `storage` for this instance of group to the outer scope (if not empty) or initialize it
    storage[group] = storage[group] || [];

    // add this item to its group within `storage`
    storage[group].push(item.values.value ? +item.values.value : '');

    // return the updated storage to the reduce function, which will then loop through the next
    return storage;
  }, {}); // {} is the initial value of the storage
}

addEventListener('message', ({ data }) => {
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
});
function counter(str) {
  return str.split('').reduce((total, letter) => {
    total[letter] ? total[letter]++ : (total[letter] = 1);
    return total;
  }, {});
}
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

function cosdis(v1, v2) {
  let commonLetters = new Set([...v1[1]].filter((x) => v2[1].has(x)));

  let numeratorArray = [];

  for (let i of commonLetters) {
    numeratorArray.push(v1[0][i] * v2[0][i]);
  }

  return numeratorArray.reduce((a, b) => a + b, 0) / v1[2] / v2[2];
}
