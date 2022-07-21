// activate strict mode
'use strict';

// library modules
const merge = require( 'deepmerge' );
const { getSpecifiedStr, getValidObj, getValidTokens, testUUID, testSHA2, testEmail } = require( '@yeasoft/baseutils' );
const { HttpStatusError } = require( '@yeasoft/fetchutils' );

// local modules
const { ResultHelper } = require( './result-helper.js' );

class ParamParser {
	constructor( options ) {
		this.options = ParamParser.consolidateOptions( options );
		this.requirers = {};
		this.validators = {};
		this.transformers = {};
	}

	all( keydefinition ) {
		let keys = getValidTokens( keydefinition );
		return ParamParser.makeMiddleware( this.options, ( params, options ) => {
			let collected = merge( {}, params );
			for ( let key in params ) {
				this.transformParam( collected, key, options );
				this.validateParam( collected, key, options );
			}
			keys.forEach( key => {
				if ( !( key in params ) ) this.transformParam( collected, key, options );
				this.requireParam( collected, key, options );
			} );
			return collected;
		} );
	}

	only( keydefinition ) {
		let specs = getValidTokens( keydefinition );
		return ParamParser.makeMiddleware( this.options, ( params, options ) => {
			let processed = merge( {}, params );
			let collected = {};
			specs.forEach( spec => {
				let parts = spec.split( '!' );
				let key = parts[ 0 ];
				let mandatory = parts.length > 1;

				if ( mandatory ) {
					this.requireParam( processed, key, options );
				}
				this.transformParam( processed, key, options );

				if ( key in processed ) {
					this.validateParam( processed, key, options );
					collected[ key ] = processed[ key ];
				}
			} );
			return collected;
		} );
	}

	allParser( keydefinition ) {
		let keys = getValidTokens( keydefinition );
		return ParamParser.makeParser( this.options, ( params, options ) => ParamParser.allHandler( this, params, keys, options ) );
	}

	onlyParser( keydefinition ) {
		let specs = getValidTokens( keydefinition );
		return ParamParser.makeParser( this.options, ( params, options ) => ParamParser.onlyHandler( this, params, specs, options ) );
	}

	setRequirer( name, requirer ) {
		if ( typeof requirer === 'string' ) requirer = ParamParser.requirers[ requirer ];
		if ( typeof requirer === 'function' ) getValidTokens( name ).forEach( name => { this.requirers[ name ] = requirer; } );
	}

	setValidator( name, validator ) {
		if ( typeof validator === 'string' ) validator = ParamParser.validators[ validator ];
		if ( typeof validator === 'function' ) getValidTokens( name ).forEach( name => { this.validators[ name ] = validator; } );
	}

	setTransformer( name, transformer ) {
		if ( typeof transformer === 'string' ) transformer = ParamParser.transformers[ transformer ];
		if ( typeof transformer === 'function' ) getValidTokens( name ).forEach( name => { this.transformers[ name ] = transformer; } );
	}

	requireParam( params, property, options ) {
		let requireFn = this.requirers[ property ];
		if ( typeof requireFn === 'function' ) {
			requireFn( params, property, options );
		}
		else if ( !( property in params ) ) {
			throw new HttpStatusError( `Mandatory parameter '${property}' not specified.`, 400 );
		}
	}

	transformParam( params, property, options ) {
		let transformFn = this.transformers[ property ];
		if ( typeof transformFn === 'function' ) {
			transformFn( params, property, options );
		}
	}

	validateParam( params, property, options ) {
		let validatorFn = this.validators[ property ];
		if ( typeof validatorFn === 'function' ) {
			validatorFn( params, property, options );
		}
	}
}

ParamParser.consolidateOptions = ( value ) => {
	let options = getValidObj( value, {} );
	options.methods = getValidTokens( options.methods );
	options.merge = getValidTokens( options.merge === 'all' ? undefined : options.merge, [ 'params', 'query', 'body' ] );
	options.errormode = [ 'exception', 'handle', 'param' ].includes( options.errormode ) ? options.errormode : 'exception';
	options.errortitle = getSpecifiedStr( options.errortitle );
	options.stringify = getValidTokens( options.stringify );

	return options;
};

ParamParser.makeMiddleware = ( options, callback ) => {
	return ( req, res, next ) => {
		try {
			if ( ( options.methods.length > 0 ) && !options.methods.includes( req.method ) ) {
				throw new HttpStatusError( "Method Not Allowed", 405 );
			}
			let entities = options.merge.map( key => ( req[ key ] instanceof Object ) && !( req[ key ] instanceof Array ) ? req[ key ] : {} );
			req.params = callback( merge.all( entities ), options, req, res );
			options.stringify.forEach( key => {
				if ( key in req.params ) {
					req.params[ key ] = JSON.stringify( req.params[ key ] );
				}
			} );
			next();
		}
		catch ( error ) {
			switch ( options.errormode ) {
				case 'param':
					req.params = { error: error, errortitle: getSpecifiedStr( options.errortitle, getSpecifiedStr( error.name, 'Error' ) ) };
					next();
					break;
				case 'handle':
					ResultHelper.error( req, res, error, options.errortitle );
					break;
				// case 'exception':
				// case undefined:
				default:
					throw error;
			}
		}
	};
};

ParamParser.makeParser = ( options, callback ) => {
	return ( params ) => {
		try {
			let result = callback( params, options );
			options.stringify.forEach( key => {
				if ( key in result ) {
					result[ key ] = JSON.stringify( result[ key ] );
				}
			} );
			return result;
		}
		catch ( error ) {
			if ( [ 'param', 'handle' ].includes( options.errormode ) ) {
				return { error: error, errortitle: getSpecifiedStr( options.errortitle, getSpecifiedStr( error.name, 'Error' ) ) };
			}
			throw error;
		}
	};
};

ParamParser.allHandler = ( self, params, keys, options ) => {
	let collected = merge( {}, params );
	for ( let key in params ) {
		self.transformParam( collected, key, options );
		self.validateParam( collected, key, options );
	}
	keys.forEach( key => {
		if ( !( key in params ) ) self.transformParam( collected, key, options );
		self.requireParam( collected, key, options );
	} );
	return collected;
};

ParamParser.onlyHandler = ( self, params, specs, options ) => {
	let processed = merge( {}, params );
	let collected = {};
	specs.forEach( spec => {
		let parts = spec.split( '!' );
		let key = parts[ 0 ];
		let mandatory = parts.length > 1;

		if ( mandatory ) {
			self.requireParam( processed, key, options );
		}
		self.transformParam( processed, key, options );

		if ( key in processed ) {
			self.validateParam( processed, key, options );
			collected[ key ] = processed[ key ];
		}
	} );
	return collected;
};

ParamParser.requirers = {};
ParamParser.validators = {
	uuid: ( params, property ) => {
		if ( !testUUID( params[ property ] ) ) {
			throw new HttpStatusError( `Invalid UUID '${params[ property ]}' specified`, 400 );
		}
	},
	sha2: ( params, property ) => {
		if ( !testSHA2( params[ property ] ) ) {
			throw new HttpStatusError( `Invalid hash '${params[ property ]}' specified`, 400 );
		}
	},
	email: ( params, property ) => {
		if ( !testEmail( params[ property ] ) ) {
			throw new HttpStatusError( `Invalid email address '${params[ property ]}' specified`, 400 );
		}
	},
};

ParamParser.transformers = {
	lower: ( params, property ) => { if ( typeof params[ property ] === 'string' ) params[ property ].toLowerCase(); },
	uppper: ( params, property ) => { if ( typeof params[ property ] === 'string' ) params[ property ].toUpperCase(); },
};

exports.ParamParser = ParamParser;