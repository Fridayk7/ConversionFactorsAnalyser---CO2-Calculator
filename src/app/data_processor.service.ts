import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/internal/operators/map';

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

  private checkIncrease(data: any) {
    for (let i = 1; i < data.length; i++) {
      if (data[i - 1] < data[i]) {
        return true;
      }
    }
    return false;
  }
}
