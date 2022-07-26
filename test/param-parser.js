const { ParamParser } = require( "../dist/param-parser.js" );
const { getSpecifiedStr } = require( "@yeasoft/baseutils" );
const { HttpStatusError } = require( "@yeasoft/fetchutils" );

function test( name, result ) {
	if ( result.error instanceof Error ) {
		console.error( `${name} failed:`, result.error );
	}
	else {
		console.log( `${name} passed:`, result );
	}
}

let parser = new ParamParser( { errormode: 'param' } );

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
// add your own transformer that makes sure you have a subject
parser.setTransformer( "subject", ( params, property ) => { params[ property ] = getSpecifiedStr( params[ property ], "No Subject" ); } );

// create a parser that returns all parameters but requires "from" to" and "subject" to be specified. "subject" will by autogenerated by the supplied tranformer.
let parseAll = parser.allParser( "from,to,subject" );
test( "Test 1", parseAll( {}, "from,to" ) );
test( "Test 2", parseAll( { from: "leo@yeasoft.com", subject: "Yeah!" } ) );
test( "Test 3", parseAll( { from: "leo@yeasoft.com", to: "Yeah!" } ) );
test( "Test 4", parseAll( { from: "leo@yeasoft.com", to: "stupid@man.com", subject: "Fuck you!" } ) );
test( "Test 5", parseAll( { from: "leo@yeasoft.com", to: "sylvia@yeasoft.com" } ) );

// create a parser that returns onöy the specified parameters but requires "from" and "to" to be specified.
let parseOnly = parser.onlyParser( "from!,to!,cc,bcc,subject" );
test( "Test 6", parseOnly( {} ) );
test( "Test 7", parseOnly( { from: "leo@yeasoft.com", subject: "Yeah!" } ) );
test( "Test 8", parseOnly( { from: "leo@yeasoft.com", to: "Yeah!" } ) );
test( "Test 9", parseOnly( { from: "leo@yeasoft.com", to: "stupid@man.com", subject: "Fuck you!" } ) );
test( "Test 10", parseOnly( { from: "leo@yeasoft.com", to: "sylvia@yeasoft.com" } ) );
