# Introduction

This system consists of two main parts: (1) Analysing conversion factor data and (2) two carbon
footprint calculators and it is designed to be used by users that require insights in the reports
of BEIS (2016-2021) and EPA (2014-2015,2018,2020-2021) or those who want to calculate the
carbon emissions of their household or household appliances.

# Description

This system is a web oriented platform which aims to provide transparency in the calculations of
carbon emissions and the conversion factor data of two publishers: (1) BEIS and (2) EPA, using
semantic web technologies. This is achieved through a series of tools that enable:

1. Data validation.
2. Tracking the evolution of conversion factors across time.
3. Comparing data of conversion factors from different publishers.
4. Calculating the carbon emissions of a household.
5. Calculating the carbon emissions of household appliances.
   All related files are stored in a GItHub repository which can be accessed via the following
   link: https://github.com/Fridayk7/ConversionFactorsAnalyser—CO2-Calculator
   For the implementation of this system, the Angular framework is selected. The system is
   separated into individual modules called ‘angular components’. Each component is self suffi-
   cient and loosely coupled with other components. Currently, the system consists of the following
   components:
6. “data-validation”: Handles the data validation screen.
7. ‘evolution chart”: Handles the screen for tracking of the evolution of conversion factors
   across time.
8. “knowledge comparison”: Handles the screen for comparing data from different publishers.
9. ‘co2-calculator-fixed’: Handles the household CO2 calculator screen.
   B.3. APPLICATION INSTALLATION 75
10. ‘co2-calculator-appliances’: Handles the appliances CO2 calculator screen.
11. ’data-service’: Handles SPARQL API requests.
12. ’data-processor’: Handles data parsing and computations.
    Furthermore each component is further split into the following files:
13. “<component-name>.ts”: A typescript file for handling the business logic and user interac-
    tion of the component.
14. “<component-name>.html”: An HTML file for structuring the user interface of the compo-
    nent.
15. “<component-name>.scss”: An SCSS file for styling.
16. “<component-name>.spec.ts”: A file that includes unit testing code and it is powered by the
    Karma & Jasmine testing framework.

# Application installation

## GitHub

Clone the GitHub repository of the system. Using your terminal navigate to the angular root folder
“ConversionFactorsAnalyser & CO2 Calculator”

## Angular Installation

1. Install node.js using the following link:
   • https://nodejs.org/en/download
   • Check your node.js version using the ‘node -v’ command. The version should be equal
   or greater to ‘v18.15.0’
2. Use ‘npm install -g typescript” to download typescript or follow the instructions from this
   link:
   • https://www.npmjs.com/package/typescript.
3. Install the angular cli using “npm install -g @angular/cli”.
4. Make sure you are in the angular root folder mention above and run the command ‘npm
   install’ which will download all dependencies required for this system.

## GraphDB installation

1. Submit an access request to GraphDB through this link:
   • https://www.ontotext.com/products/graphdb/
2. Once access is gained, follow the instructions of the following link to install GraphDB as a
   desktop application for your operating system:
   • https://www.ontotext.com/products/graphdb/
3. Open graphDB and access the ‘Repositories’ section under ‘Setup’ in the left navigation
   sidebar.
4. Press ‘Create new repository’ and create two new repositories:
   • One with the name ‘BEIS’.
   • One with the name ‘EPA_FUEL_FULL’.
5. Connect to each repository by using the dropdown on the top right of the screen.
6. For each repository, navigate to ‘Import’ using the left navigation bar.
7. Press ‘Upload RDF files’ and upload the ‘.nt’ files for each year for the selected repository.
   The files are located in the root folder of the system inside the folders with the name ‘EPA’
   and ‘BEIS’.

# Launch

To run the application, go to the project’s root folder and enter the command ‘ng serve’. Make
sure that GraphDB is running.

# How to create an RDF file

The ‘.nt’ files that define the knowledge graph are already created and can be uploaded to GraphDB
as is, as explained in the section above. This section explains the process of creating these files:

## Installation

1. Make sure you have python3 installed, or download it using the following link:
   • https://www.python.org/downloads/
2. Download morph-kgc using the command “pip install morph-kgc” or by following the steps
   from the following link:
   • https://github.com/morph-kgc/morph-kgc
3. Install yarrrml-parser using ‘npm i -g @rmlio/yarrrml-parser’ or by following the steps from
   the following link:
   • https://github.com/rmlio/yarrrml-parser

## Usage

1. Download your data source in a ‘.csv’ format.
2. Create a ‘.yaml’ file defining the RML mappings according to the structure of your data
   source. You can use the ‘.yaml’ files provided in this project as inspiration.
3. Enter the command yarrrml-parser -i <name_of_yaml_file>.yaml -o <name_of_mappings_file>.ttl
   • This command will take as input your ‘.yaml’ file and generate the RML mappings in
   a ‘.ttl’ file.
4. Create a ‘.ini. file which specifies the mappings file to be used for the creation of the
   knowledge graph and the name of the output file. Use the ‘.ini’ files provided in this project
   as example.
5. Finally, run the command ‘python -m morph_kgc <name_of_your_file>.ini’ which will run
   the morph-kgc engine and apply the mappings specified in your ‘.ini’ file to create the .’nt’
   RDF file.

# Run the tests

1. Run the command ‘ng test’ in the systems root file.
2. A browser window should open showing the results of the tests.

# System Usage

Refer to the user manual (Appendix A) for step by step instructions.

# Conventions and Error Messages

While using the local version of this system, some of the errors that may occur are the following:

1. Screens are not displaying any data.
   • Solution: Make sure GraphDB is also running and that the repositories are created as
   described above using the names provided in the steps.
2. Evolution chart does not update
   • Solution: Echarts was overloaded with requests. Try refreshing the page.
3. Unexpected error in the console
   • Solution: Click the file that the error is pointing to and use breakpoints to pinpoint
   what is causing the error.

# Directions for Future Improvements

## Knowledge extensions

The knowledge graphs of this system are designed to have specific properties with specific naming
conventions as it can be seen from the ‘.yaml’ files. For any extension of the current knowledge, it
is advised that the same mappings with the same properties are used. New properties can be freely
added as long as they don’t overlap with the existing ones.
B.8.2 SPARQL extensions
The system is designed to handle data received from the SPARQL API in a specific format, as
defined in the SPARQL queries provided in the SPARQL folder of this project. It is advised that
you follow the same naming conventions for any extension of the queries.
