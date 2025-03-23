Utilities and express middleware for parsing parameters
=======================================================

This module contains some helper class and utilities for simplifying the
task of parsing _"parameters"_ both in express based applications as
well as in other code parts.

The library may be added to any project with the following command:

````sh
# npm install @yeasoft/parseutils
````

## NOTICE

````none
Heavy work in progress. Most of the documentation is currently
only available in the corresponding .d.ts files
````

Learning by example
-------------------

Since the module is in a very early stage, there is no real documentation.
Here some examples:

### A simple parser for Objects

```js
const { ParamParser, HttpStatusError, resultHelper } = require( "@yeasoft/parseutils" );
const { getSpecifiedStr } = require( "@yeasoft/baseutils" );

function test( name, result, expect ) {
    if ( result.error instanceof Error ) {
        expect ? console.error( `${name} failed with error ${result.error.status}:`, result.error ) : console.log( `${name} passed with expected error ${result.error.status}: ${result.error.message}` );
    }
    else {
        expect ? console.log( `${name} passed:`, result ) : console.error( `${name} failed with unexpected result:`, result );
    }
}

const parser = new ParamParser( { errormode: 'param' } );

// add standard email address validator for parameters "from", "to", "cc" and "bcc
parser.setValidator( "from,to,cc,bcc", "email" );
// add your own validator for parameters "subject", "text" and "html"
parser.setValidator( "subject,text,html", ( params, property ) => {
    if ( typeof params[ property ] === 'string' ) {
        let subject = params[ property ].toLowerCase();
        if ( [ 'fuck', 'cunt', 'motherfucker' ].some( explicitWord => subject.indexOf( explicitWord ) != -1 ) ) {
            throw new HttpStatusError( "Mind your language", 451 );
        }
    }
} );
// add standard lowerize transformer for email fields
parser.setTransformer( "from,to,cc,bcc", "lower" );
// add your own transformer that makes sure you have a subject
parser.setTransformer( "subject", ( params, property ) => { params[ property ] = getSpecifiedStr( params[ property ], "No Subject" ); } );

// create a parser that returns all parameters but requires "from" to" and "subject" to be specified. "subject" will by autogenerated by the supplied tranformer.
const parseAll = parser.allParser( "from,to,subject" );
test( "Test 1", parseAll( {} ) );
test( "Test 2", parseAll( { from: "leo@yeasoft.com", subject: "Yeah!" } ) );
test( "Test 3", parseAll( { from: "leo@yeasoft.com", to: "Yeah!" } ) );
test( "Test 4", parseAll( { from: "leo@yeasoft.com", to: "stupid@man.com", subject: "Fuck you!" } ) );
test( "Test 5", parseAll( { from: "leo@yeasoft.com", to: "NOREPLY@yeasoft.com" } ), true );

// create a parser that returns onöy the specified parameters but requires "from" and "to" to be specified.
const parseOnly = parser.onlyParser( "from!,to!,cc,bcc,subject" );
test( "Test 6", parseOnly( {} ) );
test( "Test 7", parseOnly( { from: "leo@yeasoft.com", subject: "Yeah!" } ) );
test( "Test 8", parseOnly( { from: "leo@yeasoft.com", to: "Yeah!" } ) );
test( "Test 9", parseOnly( { from: "leo@yeasoft.com", to: "stupid@man.com", subject: "Fuck you!" } ) );
test( "Test 10", parseOnly( { from: "leo@yeasoft.com", to: "NOREPLY@yeasoft.com" } ), true );
```

### A simple parser for express

See how simple it is to implement a web api:

```js
const { ParamParser, HttpStatusError } = require( "@yeasoft/parseutils" );
const { getSpecifiedStr } = require( "@yeasoft/baseutils" );

const emailParser = new ParamParser( { methods: "GET,POST", errormode: 'exception' } );

// add standard email address validator for parameters "from", "to", "cc" and "bcc
parser.setValidator( "from,to,cc,bcc", "email" );
// add your own validator
parser.setValidator( "subject,text,html", ( params, property ) => {
    if ( typeof params[ property ] === 'string' ) {
        let subject = params[ property ].toLowerCase();
        if ( [ 'fuck', 'cunt', 'motherfucker' ].some( explicitWord => subject.indexOf( explicitWord ) != -1 ) ) {
            throw new HttpStatusError( "Mind your language", 451 );
        }
    }
} );
// add standard lowerize transformer for email fields
parser.setTransformer( "from,to,cc,bcc", "lower" );
// add your own transformer that makes sure you have a subject
parser.setTransformer( "subject", ( params, property ) => { params[ property ] = getSpecifiedStr( params[ property ], "No Subject" ); } );



// register routes for sending mails
httpd.all( [ 'api/send/:from/:to/:subject', 'api/send' ], parser.only(), ( req, res ) => {
    // you do have to care on parameter errors -> the parser throws an exception and everything is done by express

    // regardless of the method and way of passing the parameters (url, query params, body): everything is in req.params
    sendMyMail( req.params, ( error, result ) => {
        resultHelper.handle( req, res, error, result, 200 );
    } );
} );
```
