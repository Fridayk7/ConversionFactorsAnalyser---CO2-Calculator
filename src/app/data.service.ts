import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/internal/operators/map';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private repositories = ['EPA_TEST'];
  private missingTagsQuery =
    'http://localhost:7200/repositories/EPA_FUEL_FULL?query=SELECT%20%3FconversionFactors%20%3Ftags%20WHERE%7B%20%20%20%20%20%3FconversionFactors%20rdf%3Atype%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23EmissionConversionFactor%3E.%20%20%20%20%20FILTER%20NOT%20EXISTS%7B%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23hasTag%3E%20%3Ftags%7D%20%7D';
  private allConversionFactorsQuery =
    'http://localhost:7200/repositories/EPA_FUEL_FULL?query=PREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%20PREFIX%20rdf%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%20%20SELECT%20%3FconversionFactors%20%3Fvalues%20%3FsourceUnitNames%20%3FtargetUnitNames%20%3FlookUpNames%20%3FendDate%20WHERE%7B%20%20%20%20%20%3FconversionFactors%20rdf%3Atype%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23EmissionConversionFactor%3E.%20%20%20%20%20%3FconversionFactors%20rdf%3Avalue%20%3Fvalues.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23sourceUnit%3E%20%3FsourceUnit.%20%20%20%20%20%3FsourceUnit%20rdfs%3Alabel%20%3FsourceUnitNames.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23targetUnit%3E%20%3FtargetUnit.%20%20%20%20%20%3FtargetUnit%20rdfs%3Alabel%20%3FtargetUnitNames.%20%20%20%20%20%3FconversionFactors%20rdfs%3Adescription%20%3FlookUpNames.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23hasApplicablePeriod%3E%20%3FapplicablePeriod.%20%20%20%20%20%3FapplicablePeriod%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23hasEnd%3E%20%3FendDateS.%20%20%20%20%20%3FendDateS%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23inXSDDate%3E%20%3FendDate.%20%7D';
  private missingTagsResult = {
    'check-name': 'Missing Tags',
    data: '',
  };
  private allConversionFactorsResult = [];
  constructor(private _http: HttpClient) {}

  getMissingTags() {
    return this._http.get(this.missingTagsQuery).pipe(
      map((result: any) => {
        this.missingTagsResult.data = result.results.bindings;
        return this.missingTagsResult;
      })
    );
  }
  // --------------------------------------------------------------------------------------------------------------------
  // INTERESTING NOTE IN THE DOCUMENT
  // --------------------------------------------------------------------------------------------------------------------

  getConversionFactors() {
    return this._http.get(this.allConversionFactorsQuery).pipe(
      map((result: any) => {
        this.allConversionFactorsResult = result.results.bindings;
        console.log(result);
        return this.allConversionFactorsResult;
      })
    );
  }
}
