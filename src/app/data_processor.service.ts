import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from './data.service';
import { Observable, combineLatest, of } from 'rxjs';
declare var require: any;
@Injectable({
  providedIn: 'root',
})
export class DataProccessorService {
  groupSimilarTags(data: any) {
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
      storage[i] = this.groupSimilar(storage[i]);
    }

    return storage;
  }
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

  getAppliances(data: any) {
    let appliances = [];
    data.forEach((x: any) => appliances.push(x.title.value));
    return appliances;
  }

  // Finds increases in value in in an array of numbers
  findSingleFluctuations(data: any) {
    return Object.keys(data)
      .filter((key) => this.checkIncrease(data[key]))
      .reduce((cur, key) => {
        return Object.assign(cur, { [key]: data[key] });
      }, {});
  }
  // Finds increases in value in in an object of arrays of numbers
  findFluctuations(data: any) {
    let flux = {};

    for (let i in data) {
      let fluxtemp = Object.keys(data[i])
        .filter((key) => this.checkIncrease(data[i][key]))
        .reduce((cur, key) => {
          return Object.assign(cur, { [key]: data[i][key] });
        }, {});
      flux = { ...flux, ...fluxtemp };
    }

    return flux;
  }

  // Transforms validation check results into ag-grid format
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
    console.log('NEGATIVE');
    console.log(negativeValues);

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
    if (negativeValues.length) {
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

  // Transforms input into a 'knowledge-graph' like structure
  transformCFtoKGstructure(name, source, target, value, tags?) {
    return {
      lookUpNames: { type: 'literal', value: name },
      sourceUnitNames: { type: 'literal', value: source },
      tagNames: { type: 'literal', value: tags ? tags : '' },
      targetUnitNames: { type: 'literal', value: target },
      values: { type: 'literal', value: value },
    };
  }
}
