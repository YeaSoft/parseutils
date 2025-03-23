'use strict';

const test = require( 'node:test' );
const assert = require( 'node:assert' );

const { getSpecifiedStr } = require( "@yeasoft/baseutils" );
const { HttpStatusError } = require( "@yeasoft/basetypes" );

const { ParamParser } = require( "../dist/index.js" );

function createParser() {
	// create the parser
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

	return parser;
}

test( "Testing a ParamParser with validators and transformers", async ( t ) => {
	const parser = createParser();

	t.test( "Testing allParser - test 1", () => {
		const parseAll = parser.allParser( "from,to,subject" );
		assert.strictEqual( parseAll( {} ).error?.status, 400 );
	} );

	await t.test( "Testing allParser - test 2", () => {
		const parseAll = parser.allParser( "from,to,subject" );
		assert.strictEqual( parseAll( { from: "leo@yeasoft.com", subject: "Yeah!" } ).error?.status, 400 );
	} );

	await t.test( "Testing allParser - test 3", () => {
		const parseAll = parser.allParser( "from,to,subject" );
		assert.strictEqual( parseAll( { from: "leo@yeasoft.com", to: "Yeah!" } ).error?.status, 400 );
	} );

	await t.test( "Testing allParser - test 4", () => {
		const parseAll = parser.allParser( "from,to,subject" );
		assert.strictEqual( parseAll( { from: "leo@yeasoft.com", to: "stupid@man.com", subject: "Fuck you!" } ).error?.status, 451 );
	} );

	await t.test( "Testing onlyParser - test 5", () => {
		const parseAll = parser.allParser( "from,to,subject" );
		assert.strictEqual( parseAll( { from: "leo@yeasoft.com", to: "NOREPLY@yeasoft.com" } ).error, undefined );
	} );

	await t.test( "Testing allParser - test 1", () => {
		const parseOnly = parser.onlyParser( "from!,to!,cc,bcc,subject" );
		assert.strictEqual( parseOnly( {} ).error?.status, 400 );
	} );

	await t.test( "Testing allParser - test 2", () => {
		const parseOnly = parser.onlyParser( "from!,to!,cc,bcc,subject" );
		assert.strictEqual( parseOnly( { from: "leo@yeasoft.com", subject: "Yeah!" } ).error?.status, 400 );
	} );

	await t.test( "Testing allParser - test 3", () => {
		const parseOnly = parser.onlyParser( "from!,to!,cc,bcc,subject" );
		assert.strictEqual( parseOnly( { from: "leo@yeasoft.com", to: "Yeah!" } ).error?.status, 400 );
	} );

	await t.test( "Testing allParser - test 4", () => {
		const parseOnly = parser.onlyParser( "from!,to!,cc,bcc,subject" );
		assert.strictEqual( parseOnly( { from: "leo@yeasoft.com", to: "stupid@man.com", subject: "Fuck you!" } ).error?.status, 451 );
	} );

	await t.test( "Testing allParser - test 5", () => {
		const parseOnly = parser.onlyParser( "from!,to!,cc,bcc,subject" );
		assert.strictEqual( parseOnly( { from: "leo@yeasoft.com", to: "NOREPLY@yeasoft.com" } ).error, undefined );
	} );
} );
