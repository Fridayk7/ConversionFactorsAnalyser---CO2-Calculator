import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/internal/operators/map';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  // BEIS all conversion factors query API endpoint
  private beisCF =
    'http://localhost:7200/repositories/BEIS?query=PREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%20PREFIX%20rdf%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%20%20PREFIX%20ns2%3A%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23%3E%20PREFIX%20ns3%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23%3E%20SELECT%20%3FconversionFactors%20%3Fvalues%20%3FsourceUnitNames%20%3FtargetUnitNames%20%3FlookUpNames%20%3FendDate%20%20%20(group_concat(%3FtagNames%3B%20separator%3D%22%2C%20%22)%20AS%20%3FtagNames)%20%20WHERE%7B%20%20%20%20%20%3FconversionFactors%20rdf%3Atype%20ns2%3AEmissionConversionFactor.%20%20%20%20%20%3FconversionFactors%20rdf%3Avalue%20%3Fvalues.%20%20%20%20%20%3FconversionFactors%20ns2%3AsourceUnit%20%3FsourceUnit.%20%20%20%20%20%3FsourceUnit%20rdfs%3Alabel%20%3FsourceUnitNames.%20%20%20%20%20%3FconversionFactors%20ns2%3AtargetUnit%20%3FtargetUnit.%20%20%20%20%20%3FtargetUnit%20rdfs%3Alabel%20%3FtargetUnitNames.%20%20%20%20%20%3FconversionFactors%20rdfs%3Adescription%20%3FlookUpNames.%20%20%20%20%20%3FconversionFactors%20ns2%3AhasTag%20%3Ftags.%20%20%20%20%20%3Ftags%20rdfs%3Alabel%20%3FtagNames.%20%20%20%20%20%3FapplicablePeriod%20ns3%3AhasEnd%20%3FendDateIrl.%20%20%20%20%20%3FendDateIrl%20ns3%3AinXSDDate%20%3FendDate.%20%20%7D%20GROUP%20BY%20%3FconversionFactors%20%3Fvalues%20%3FsourceUnitNames%20%3FtargetUnitNames%20%3FlookUpNames%20%3FendDate';

  // Missing tags query API endpoint that accepts the id of a knowledge graph as input
  missingTagsQuery = (id) =>
    `http://localhost:7200/repositories/${id}?query=PREFIX%20cf%3A%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23%3E%20PREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%20PREFIX%20rdf%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%20%20SELECT%20%3FconversionFactors%20%3FsourceUnitNames%20%3FtargetUnitNames%20%3FlookUpNames%20%3FendDate%20WHERE%7B%20%20%20%20%20%3FconversionFactors%20rdf%3Atype%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23EmissionConversionFactor%3E.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23sourceUnit%3E%20%3FsourceUnit.%20%20%20%20%20%3FsourceUnit%20rdfs%3Alabel%20%3FsourceUnitNames.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23targetUnit%3E%20%3FtargetUnit.%20%20%20%20%20%3FtargetUnit%20rdfs%3Alabel%20%3FtargetUnitNames.%20%20%20%20%20FILTER%20NOT%20EXISTS%7B%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23hasTag%3E%20%3Ftags%20%7D.%20%20%20%20%20%3FconversionFactors%20rdfs%3Adescription%20%3FlookUpNames.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23hasApplicablePeriod%3E%20%3FapplicablePeriod.%20%20%20%20%20%3FapplicablePeriod%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23hasEnd%3E%20%3FendDateIrl.%20%20%20%20%20%3FendDateIrl%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23inXSDDate%3E%20%3FendDate%20%7D`;

  // All conversion factors query API endpoint that accepts the id of a knowledge graph as input
  allConversionFactorsQuery = (id) =>
    `http://localhost:7200/repositories/${id}?query=PREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%20PREFIX%20rdf%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%20%20PREFIX%20ns2%3A%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23%3E%20PREFIX%20ns3%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23%3E%20SELECT%20%3FconversionFactors%20%3Fvalues%20%3FsourceUnitNames%20%3FtargetUnitNames%20%3FlookUpNames%20%3FendDate%20%3Fcomments%20%20%20(group_concat(%3FtagNames%3B%20separator%3D%22%2C%20%22)%20AS%20%3FtagNames)%20%20WHERE%7B%20%20%20%20%20%3FconversionFactors%20rdf%3Atype%20ns2%3AEmissionConversionFactor.%20%20%20%20%20%3FconversionFactors%20rdf%3Avalue%20%3Fvalues.%20%20%20%20%20%3FconversionFactors%20ns2%3AsourceUnit%20%3FsourceUnit.%20%20%20%20%20%3FsourceUnit%20rdfs%3Alabel%20%3FsourceUnitNames.%20%20%20%20%20%3FconversionFactors%20ns2%3AtargetUnit%20%3FtargetUnit.%20%20%20%20%20%3FtargetUnit%20rdfs%3Alabel%20%3FtargetUnitNames.%20%20%20%20%20%3FconversionFactors%20rdfs%3Adescription%20%3FlookUpNames.%20%20%20%20%20%3FconversionFactors%20ns2%3AhasTag%20%3Ftags.%20%20%20%20%20%3Ftags%20rdfs%3Alabel%20%3FtagNames.%20%20%20%20%20%3FconversionFactors%20ns2%3AhasApplicablePeriod%20%3FapplicablePeriod.%20%20%20%20%20%3FapplicablePeriod%20ns3%3AhasEnd%20%3FendDateIrl.%20%20%20%20%20%3FendDateIrl%20ns3%3AinXSDDate%20%3FendDate.%20%20%20%20%20OPTIONAL%7B%20%3FconversionFactors%20rdfs%3Acomment%20%3Fcomments.%7D%20%20%7D%20GROUP%20BY%20%3FconversionFactors%20%3Fvalues%20%3FsourceUnitNames%20%3FtargetUnitNames%20%3FlookUpNames%20%3FendDate%20%3Fcomments`;

  // Missing values query API endpoint that accepts the id of a knowledge graph as input
  missingValuesQuery = (id) =>
    `http://localhost:7200/repositories/${id}?query=PREFIX%20cf%3A%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23%3E%20PREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%20PREFIX%20rdf%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%20%20SELECT%20%3FconversionFactors%20%3FsourceUnitNames%20%3FtargetUnitNames%20%3FlookUpNames%20%3FendDate%20WHERE%7B%20%20%20%20%20%3FconversionFactors%20rdf%3Atype%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23EmissionConversionFactor%3E.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23sourceUnit%3E%20%3FsourceUnit.%20%20%20%20%20%3FsourceUnit%20rdfs%3Alabel%20%3FsourceUnitNames.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23targetUnit%3E%20%3FtargetUnit.%20%20%20%20%20%3FtargetUnit%20rdfs%3Alabel%20%3FtargetUnitNames.%20%20%20%20%20FILTER%20NOT%20EXISTS%7B%3FconversionFactors%20rdf%3Avalue%20%3FmissingValues%20%7D.%20%20%20%20%20%3FconversionFactors%20rdfs%3Adescription%20%3FlookUpNames.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23hasApplicablePeriod%3E%20%3FapplicablePeriod.%20%20%20%20%20%3FapplicablePeriod%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23hasEnd%3E%20%3FendDateIrl.%20%20%20%20%20%3FendDateIrl%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23inXSDDate%3E%20%3FendDate%20%7D`;

  // Missing source unit query API endpoint that accepts the id of a knowledge graph as input
  missingSourceUnitQuery = (id) =>
    `http://localhost:7200/repositories/${id}?query=PREFIX%20cf%3A%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23%3E%20PREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%20PREFIX%20rdf%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%20%20SELECT%20%3FconversionFactors%20%3FtargetUnitNames%20%3FlookUpNames%20%3FendDate%20WHERE%7B%20%20%20%20%20%3FconversionFactors%20rdf%3Atype%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23EmissionConversionFactor%3E.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23sourceUnit%3E%20%3FsourceUnit.%20%20%20%20%20FILTER%20NOT%20EXISTS%7B%3FsourceUnit%20rdfs%3Alabel%20%3FsourceUnitNames.%20%7D.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23targetUnit%3E%20%3FtargetUnit.%20%20%20%20%20%3FtargetUnit%20rdfs%3Alabel%20%3FtargetUnitNames.%20%20%20%20%20%3FconversionFactors%20rdfs%3Adescription%20%3FlookUpNames.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23hasApplicablePeriod%3E%20%3FapplicablePeriod.%20%20%20%20%20%3FapplicablePeriod%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23hasEnd%3E%20%3FendDateIrl.%20%20%20%20%20%3FendDateIrl%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23inXSDDate%3E%20%3FendDate.%20%7D`;

  // Missing target unnits query API endpoint that accepts the id of a knowledge graph as input
  missingTargetUnitQuery = (id) =>
    `http://localhost:7200/repositories/${id}?query=PREFIX%20cf%3A%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23%3E%20PREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%20PREFIX%20rdf%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%20%20SELECT%20%3FconversionFactors%20%3FsourceUnitNames%20%3FlookUpNames%20%3FendDate%20WHERE%7B%20%20%20%20%20%3FconversionFactors%20rdf%3Atype%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23EmissionConversionFactor%3E.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23targetUnit%3E%20%3FtargetUnit.%20%20%20%20%20FILTER%20NOT%20EXISTS%7B%3FtargetUnit%20rdfs%3Alabel%20%3FtargetUnitNames.%20%7D.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23sourceUnit%3E%20%3FsourceUnit.%20%20%20%20%20%3FsourceUnit%20rdfs%3Alabel%20%3FsourceUnitNames.%20%20%20%20%20%3FconversionFactors%20rdfs%3Adescription%20%3FlookUpNames.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23hasApplicablePeriod%3E%20%3FapplicablePeriod.%20%20%20%20%20%3FapplicablePeriod%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23hasEnd%3E%20%3FendDateIrl.%20%20%20%20%20%3FendDateIrl%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23inXSDDate%3E%20%3FendDate.%20%7D`;

  // Negative values query API endpoint that accepts the id of a knowledge graph as input
  negativeValuesQuery = (id) =>
    `http://localhost:7200/repositories/${id}?query=PREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%20PREFIX%20rdf%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%20%20SELECT%20%3FconversionFactors%20%3Fvalues%20%3FsourceUnitNames%20%3FtargetUnitNames%20%3FlookUpNames%20%3FendDate%20WHERE%7B%20%20%20%20%20%3FconversionFactors%20rdf%3Atype%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23EmissionConversionFactor%3E.%20%20%20%20%20%3FconversionFactors%20rdf%3Avalue%20%3Fvalues.%20%20%20%20%20FILTER%20(%20%3Fvalues%20%3C%200%20)%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23sourceUnit%3E%20%3FsourceUnit.%20%20%20%20%20%3FsourceUnit%20rdfs%3Alabel%20%3FsourceUnitNames.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23targetUnit%3E%20%3FtargetUnit.%20%20%20%20%20%3FtargetUnit%20rdfs%3Alabel%20%3FtargetUnitNames.%20%20%20%20%20%3FconversionFactors%20rdfs%3Adescription%20%3FlookUpNames.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23hasApplicablePeriod%3E%20%3FapplicablePeriod.%20%20%20%20%20%3FapplicablePeriod%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23hasEnd%3E%20%3FendDateIrl.%20%20%20%20%20%3FendDateIrl%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23inXSDDate%3E%20%3FendDate.%20%7D`;

  // Missing start date query API endpoint that accepts the id of a knowledge graph as input
  missingStartDateQuery = (id) =>
    `http://localhost:7200/repositories/${id}?query=PREFIX%20cf%3A%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23%3E%20PREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%20PREFIX%20rdf%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%20%20SELECT%20%3FconversionFactors%20%3FsourceUnitNames%20%3FtargetUnitNames%20%3FlookUpNames%20%3FendDate%20WHERE%7B%20%20%20%20%20%3FconversionFactors%20rdf%3Atype%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23EmissionConversionFactor%3E.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23sourceUnit%3E%20%3FsourceUnit.%20%20%20%20%20%3FsourceUnit%20rdfs%3Alabel%20%3FsourceUnitNames.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23targetUnit%3E%20%3FtargetUnit.%20%20%20%20%20%3FtargetUnit%20rdfs%3Alabel%20%3FtargetUnitNames.%20%20%20%20%20%3FconversionFactors%20rdfs%3Adescription%20%3FlookUpNames.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23hasApplicablePeriod%3E%20%3FapplicablePeriod.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23hasApplicablePeriod%3E%20%3FapplicablePeriod.%20%20%20%20%20%3FapplicablePeriod%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23hasEnd%3E%20%3FendDateIrl.%20%20%20%20%20%3FendDateIrl%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23inXSDDate%3E%20%3FendDate.%20%20%20%20%20FILTER%20NOT%20EXISTS%7B%3FapplicablePeriod%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23hasBeginning%3E%20%3FstartDate%20%7D.%20%7D`;

  // Missing end date query API endpoint that accepts the id of a knowledge graph as input
  missingEndDateQuery = (id) =>
    `http://localhost:7200/repositories/${id}?query=PREFIX%20cf%3A%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23%3E%20PREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%20PREFIX%20rdf%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%20%20SELECT%20%3FconversionFactors%20%3FsourceUnitNames%20%3FtargetUnitNames%20%3FlookUpNames%20%3FstartDate%20WHERE%7B%20%20%20%20%20%3FconversionFactors%20rdf%3Atype%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23EmissionConversionFactor%3E.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23sourceUnit%3E%20%3FsourceUnit.%20%20%20%20%20%3FsourceUnit%20rdfs%3Alabel%20%3FsourceUnitNames.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23targetUnit%3E%20%3FtargetUnit.%20%20%20%20%20%3FtargetUnit%20rdfs%3Alabel%20%3FtargetUnitNames.%20%20%20%20%20%3FconversionFactors%20rdfs%3Adescription%20%3FlookUpNames.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23hasApplicablePeriod%3E%20%3FapplicablePeriod.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23hasApplicablePeriod%3E%20%3FapplicablePeriod.%20%20%20%20%20%3FapplicablePeriod%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23hasBeginning%3E%20%3FstartDateIrl.%20%20%20%20%20%3FstartDateIrl%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23inXSDDate%3E%20%3FstartDate.%20%20%20%20%20FILTER%20NOT%20EXISTS%7B%3FapplicablePeriod%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23hasEnd%3E%20%3FendDate%20%7D.%20%7D`;

  // Missing country query API endpoint that accepts the id of a knowledge graph as input
  missingCountryQuery = (id) =>
    `http://localhost:7200/repositories/${id}?query=PREFIX%20cf%3A%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23%3E%20PREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%20PREFIX%20rdf%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%20%20SELECT%20%3FconversionFactors%20%3FsourceUnitNames%20%3FtargetUnitNames%20%3FlookUpNames%20%3FendDate%20WHERE%7B%20%20%20%20%20%3FconversionFactors%20rdf%3Atype%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23EmissionConversionFactor%3E.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23sourceUnit%3E%20%3FsourceUnit.%20%20%20%20%20%3FsourceUnit%20rdfs%3Alabel%20%3FsourceUnitNames.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23targetUnit%3E%20%3FtargetUnit.%20%20%20%20%20%3FtargetUnit%20rdfs%3Alabel%20%3FtargetUnitNames.%20%20%20%20%20%3FconversionFactors%20rdfs%3Adescription%20%3FlookUpNames.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23hasApplicablePeriod%3E%20%3FapplicablePeriod.%20%20%20%20%20%3FapplicablePeriod%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23hasEnd%3E%20%3FendDateIrl.%20%20%20%20%20%3FendDateIrl%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23inXSDDate%3E%20%3FendDate.%20%20%20%20%20FILTER%20NOT%20EXISTS%7B%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23hasApplicableLocation%3E%20%3FapplicableLocation%7D.%20%7D`;

  // Returns entities with name, source units and target unit as defined form the input
  CfFormData = (name, source, target) =>
    `http://localhost:7200/repositories/BEIS?query=PREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%20PREFIX%20rdf%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%20%20SELECT%20%3FconversionFactors%20%3Fvalues%20%3FendDate%20%20WHERE%7B%20%20%20%20%20%3FconversionFactors%20rdf%3Atype%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23EmissionConversionFactor%3E.%20%20%20%20%20%3FconversionFactors%20rdfs%3Adescription%20%22${name}%22.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23sourceUnit%3E%09%3FsourceUnits%20.%20%20%20%20%20%3FsourceUnits%20rdfs%3Alabel%20%22${source}%22.%20%20%20%20%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23targetUnit%3E%09%3FtargetUnits%20.%20%20%20%20%20%3FtargetUnits%20rdfs%3Alabel%20%22${target}%22.%20%20%20%20%20%3FconversionFactors%20rdf%3Avalue%20%3Fvalues.%20%20%20%20%20%3FconversionFactors%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23hasApplicablePeriod%3E%20%3FapplicablePeriod.%20%20%20%20%20%3FapplicablePeriod%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23hasEnd%3E%20%3FendDateIrl.%20%20%20%20%20%3FendDateIrl%20%3Chttp%3A%2F%2Fwww.w3.org%2F2006%2Ftime%23inXSDDate%3E%20%3FendDate.%20%7D`;

  // Returns all appliances
  private appliancesQuery =
    'http://localhost:7200/repositories/Appliances?query=PREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%20PREFIX%20rdf%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%20%20SELECT%20%3Fappliances%20%3Ftitle%20%3Fdescription%20%3Ftagnames%20WHERE%7B%20%20%20%20%20%3Fappliances%20rdf%3Atype%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23HouseholdAppliance%3E.%20%20%20%20%20%3Fappliances%20rdfs%3Alabel%20%3Ftitle.%20%20%20%20%20%3Fappliances%20rdfs%3Adescription%20%3Fdescription.%20%20%20%20%20%3Fappliances%20%3Chttps%3A%2F%2Fw3id.org%2Fecfo%23hasTag%3E%20%3Ftags.%20%20%20%20%20%3Ftags%20rdfs%3Alabel%20%3Ftagnames%20%7D';

  constructor(private _http: HttpClient) {}

  getFormData(name, source, target) {
    name = name.replace(/\s/g, '%20');
    console.log(name);
    source = source.replace(/\s/g, '%20');
    target = target.replace(/\s/g, '%20');
    console.log(this.CfFormData(name, source, target));

    return this._http.get(this.CfFormData(name, source, target)).pipe(
      map((result: any) => {
        return result.results.bindings;
      })
    );
  }

  getAllCFs(id) {
    return this._http.get(this.allConversionFactorsQuery(id)).pipe(
      map((result: any) => {
        return result.results.bindings;
      })
    );
  }

  getBEIS() {
    return this._http.get(this.beisCF).pipe(
      map((result: any) => {
        return result.results.bindings;
      })
    );
  }

  getAppliances() {
    return this._http.get(this.appliancesQuery).pipe(
      map((result: any) => {
        return result.results.bindings;
      })
    );
  }

  getMissingTags(id) {
    return this._http.get(this.missingTagsQuery(id)).pipe(
      map((result: any) => {
        return result.results.bindings;
      })
    );
  }
  getMissingValues(id) {
    return this._http.get(this.missingValuesQuery(id)).pipe(
      map((result: any) => {
        return result.results.bindings;
      })
    );
  }
  getMissingSourceUnits(id) {
    return this._http.get(this.missingSourceUnitQuery(id)).pipe(
      map((result: any) => {
        return result.results.bindings;
      })
    );
  }
  getMissingTargetUnits(id) {
    return this._http.get(this.missingTargetUnitQuery(id)).pipe(
      map((result: any) => {
        return result.results.bindings;
      })
    );
  }
  getNegativeValues(id) {
    return this._http.get(this.negativeValuesQuery(id)).pipe(
      map((result: any) => {
        return result.results.bindings;
      })
    );
  }
  getMissingStartDates(id) {
    return this._http.get(this.missingStartDateQuery(id)).pipe(
      map((result: any) => {
        return result.results.bindings;
      })
    );
  }
  getMissingEndDates(id) {
    return this._http.get(this.missingEndDateQuery(id)).pipe(
      map((result: any) => {
        return result.results.bindings;
      })
    );
  }
  getMissingCountries(id) {
    return this._http.get(this.missingCountryQuery(id)).pipe(
      map((result: any) => {
        return result.results.bindings;
      })
    );
  }
}
