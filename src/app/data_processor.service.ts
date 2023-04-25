import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from './data.service';
import { combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataProccessorService {
  groupSimilar(data: any) {
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

  sortByDate(data: any) {
    return data
      .sort(function (a: any, b: any) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return b.endDate.value - a.endDate.value;
      })
      .reverse();
  }

  sortByName(data: any) {
    data.sort((a: any, b: any) =>
      b.lookUpNames.value.localeCompare(a.lookUpNames.value)
    );
    return data;
  }

  convertDate(data: any) {
    data.map((x: any) => (x.endDate.value = new Date(x.endDate.value)));
    return data;
  }

  findFluctuations(data: any) {
    return Object.keys(data)
      .filter((key) => this.checkIncrease(data[key]))
      .reduce((cur, key) => {
        return Object.assign(cur, { [key]: data[key] });
      }, {});
  }

  transformQualityChecks(
    missingValues: any,
    missingTags: any,
    missingSourceUnits: any,
    missingTargetUnits: any,
    negativeValues: any,
    missingStartDates: any,
    missingEndDates: any,
    missingCountries: any
  ) {
    let validations: any = [];

    if (missingValues.length) {
      missingValues.forEach((x: any) => {
        validations.push({
          checkName: 'Missing Value',
          lookupName: x.lookUpNames.value,
          sourceUnit: x.sourceUnitNames.value,
          targeUnit: x.targetUnitNames.value,
          year: new Date(x.endDate.value),
        });
      });
    } else {
      validations.push({
        checkName: 'Missing Value',
        lookupName: 'No Data Found',
        sourceUnit: 'No Data Found',
        targeUnit: 'No Data Found',
        year: 'No Data Found',
      });
    }
    if (missingTags.length) {
      missingTags.forEach((x: any) => {
        validations.push({
          checkName: 'Missing Tags',
          lookupName: x.lookUpNames.value,
          sourceUnit: x.sourceUnitNames.value,
          targeUnit: x.targetUnitNames.value,
          year: new Date(x.endDate.value),
        });
      });
    } else {
      validations.push({
        checkName: 'Missing Tags',
        lookupName: 'No Data Found',
        sourceUnit: 'No Data Found',
        targeUnit: 'No Data Found',
        year: 'No Data Found',
      });
    }
    if (missingSourceUnits.length) {
      missingSourceUnits.forEach((x: any) => {
        validations.push({
          checkName: 'Missing Source Unit',
          lookupName: x.lookUpNames.value,
          sourceUnit: '',
          targeUnit: x.targetUnitNames.value,
          year: new Date(x.endDate.value),
        });
      });
    } else {
      validations.push({
        checkName: 'Missing Source Unit',
        lookupName: 'No Data Found',
        sourceUnit: 'No Data Found',
        targeUnit: 'No Data Found',
        year: 'No Data Found',
      });
    }
    if (missingTargetUnits.length) {
      missingTargetUnits.forEach((x: any) => {
        validations.push({
          checkName: 'Missing Target Unit',
          lookupName: x.lookUpNames.value,
          sourceUnit: x.sourceUnitNames.value,
          targeUnit: '',
          year: new Date(x.endDate.value),
        });
      });
    } else {
      validations.push({
        checkName: 'Missing Target Unit',
        lookupName: 'No Data Found',
        sourceUnit: 'No Data Found',
        targeUnit: 'No Data Found',
        year: 'No Data Found',
      });
    }
    if (missingTargetUnits.length) {
      negativeValues.forEach((x: any) => {
        validations.push({
          checkName: 'Negative Values',
          lookupName: x.lookUpNames.value,
          sourceUnit: x.sourceUnitNames.value,
          targeUnit: x.targetUnitNames.value,
          year: new Date(x.endDate.value),
        });
      });
    } else {
      validations.push({
        checkName: 'Negative Values',
        lookupName: 'No Data Found',
        sourceUnit: 'No Data Found',
        targeUnit: 'No Data Found',
        year: 'No Data Found',
      });
    }
    if (missingTargetUnits.length) {
      missingStartDates.forEach((x: any) => {
        validations.push({
          checkName: 'Missing Start Date',
          lookupName: x.lookUpNames.value,
          sourceUnit: x.sourceUnitNames.value,
          targeUnit: x.targetUnitNames.value,
          year: new Date(x.endDate.value),
        });
      });
    } else {
      validations.push({
        checkName: 'Missing Start Date',
        lookupName: 'No Data Found',
        sourceUnit: 'No Data Found',
        targeUnit: 'No Data Found',
        year: 'No Data Found',
      });
    }
    if (missingTargetUnits.length) {
      missingEndDates.forEach((x: any) => {
        validations.push({
          checkName: 'Missing End Date',
          lookupName: x.lookUpNames.value,
          sourceUnit: x.sourceUnitNames.value,
          targeUnit: x.targetUnitNames.value,
          year: new Date(x.startDate.value),
        });
      });
    } else {
      validations.push({
        checkName: 'Missing End Date',
        lookupName: 'No Data Found',
        sourceUnit: 'No Data Found',
        targeUnit: 'No Data Found',
        year: 'No Data Found',
      });
    }
    if (missingTargetUnits.length) {
      missingCountries.forEach((x: any) => {
        validations.push({
          checkName: 'Missing Country',
          lookupName: x.lookUpNames.value,
          sourceUnit: x.sourceUnitNames.value,
          targeUnit: x.targetUnitNames.value,
          year: new Date(x.endDate.value),
        });
      });
    } else {
      validations.push({
        checkName: 'Missing Country',
        lookupName: 'No Data Found',
        sourceUnit: 'No Data Found',
        targeUnit: 'No Data Found',
        year: 'No Data Found',
      });
    }
    return validations;
  }

  private checkIncrease(data: any) {
    for (let i = 1; i < data.length; i++) {
      if (data[i - 1] < data[i]) {
        return true;
      }
    }
    return false;
  }

  counter = (str) => {
    return str.split('').reduce((total, letter) => {
      total[letter] ? total[letter]++ : (total[letter] = 1);
      return total;
    }, {});
  };

  private word2vec(word) {
    let charFreq = this.counter(word);

    let charSet = new Set(Object.keys(charFreq));

    let powerArray = [];
    for (let i in charFreq) {
      powerArray.push(charFreq[i] * charFreq[i]);
    }
    let lengthw = Math.sqrt(powerArray.reduce((a, b) => a + b, 0));

    return [charFreq, charSet, lengthw];
  }

  private cosdis(v1, v2) {
    let commonLetters = new Set([...v1[1]].filter((x) => v2[1].has(x)));

    let numeratorArray = [];

    for (let i of commonLetters) {
      numeratorArray.push(v1[0][i] * v2[0][i]);
    }

    return numeratorArray.reduce((a, b) => a + b, 0) / v1[2] / v2[2];
  }
  compareDataSets(data1: any, data2: any) {
    var stringSimilarity = require('string-similarity');
    let cosineSimilarity = (str1, str2) => {
      return this.cosdis(this.word2vec(str1), this.word2vec(str2));
    };
    let diceIntersection = [];
    let cosineIntersection = [];
    let threshhold = 0.3;

    for (let i of data1) {
      for (let j of data2) {
        if (
          stringSimilarity.compareTwoStrings(
            i.lookUpNames.value,
            j.lookUpNames.value
          ) > 0.4 &&
          stringSimilarity.compareTwoStrings(
            i.sourceUnitNames.value,
            j.sourceUnitNames.value
          ) > 0.2 &&
          stringSimilarity.compareTwoStrings(
            i.targetUnitNames.value,
            j.targetUnitNames.value
          ) >= 0.9
        ) {
          diceIntersection.push([i, j]);
        }

        if (
          cosineSimilarity(i.lookUpNames.value, j.lookUpNames.value) > 0.1 &&
          cosineSimilarity(i.sourceUnitNames.value, j.sourceUnitNames.value) >
            0.1 &&
          cosineSimilarity(i.targetUnitNames.value, j.targetUnitNames.value) >=
            0.1
        ) {
          cosineIntersection.push([i, j]);
        }
      }
    }
    console.log({ dice: diceIntersection, cosine: cosineIntersection });
    return { dice: diceIntersection, cosine: cosineIntersection };

    // var similarity = stringSimilarity.compareTwoStrings(
    //   'Coal (industrial)',
    //   'Coal'
    // );

    // return similarity;
  }

  // compareDataSetsJaccard(data1: any, data2: any) {
  //   let jaccard = require('jaccard-similarity-sentences');
  //   let intersection = [];
  //   let threshhold = 0.3;
  //   var similarity = jaccard.jaccardSimilarity('kg CO2', 'kg CO2e');
  //   console.log(similarity);

  //   for (let i of data1) {
  //     for (let j of data2) {
  //       if (
  //         jaccard.jaccardSimilarity(i.lookUpNames.value, j.lookUpNames.value) >
  //           0.4 &&
  //         jaccard.jaccardSimilarity(
  //           i.sourceUnitNames.value,
  //           j.sourceUnitNames.value
  //         ) > 0.3 &&
  //         jaccard.jaccardSimilarity(
  //           i.targetUnitNames.value,
  //           j.targetUnitNames.value
  //         ) >= 0.9
  //       ) {
  //         intersection.push([i, j]);
  //       }
  //     }
  //   }
  //   return intersection;
  // }
}
