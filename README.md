# dc soundchicks sources

Repository of scrapers for the music venues in DC. Endebted to the work of Tom Macwright's [tonight-sources](https://github.com/tmcw/tonight-sources) for scraper infrastructure and knowledge.

## Venues

* DC9: http://www.dcnine.com/calendar/

## Installing and using this project
To install project dependencies in package.json:
````
npm install
````
To get scraper data, navigate to bin and run:
````
node dcsoundcheck-pull
````
Json file for dc9.js will be generated in json-output.

## TO-DOs:
1. Decide on json format for all scrapers. Organize by time? Band? 
2. Generate separate venue specific files or one large file?