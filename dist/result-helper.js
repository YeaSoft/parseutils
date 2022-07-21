// activate strict mode
'use strict';

// library modules
const { getValidIntRange, getSpecifiedStr } = require( '@yeasoft/baseutils' );

// implementation
const ResultHelper = {};

ResultHelper.finish = ( req, res, data, status ) => {
	res.format( {
		json: () => {
			res.status( getValidIntRange( status, 100, 399, 200 ) ).send( data );
		},
		default: () => {
			res.status( 406 ).send( 'Not Acceptable' );
		}
	} );
	return false;
};

ResultHelper.error = ( req, res, error, title ) => {
	if ( error ) {
		var err = {
			"title": getSpecifiedStr( title, getSpecifiedStr( error.name, 'Error' ) ),
			"message": getSpecifiedStr( error.message, 'Unknown error' ),
		};
		if ( 'code' in error ) err.code = error.code;
		if ( 'errno' in error ) err.id = error.errno;
		if ( 'value' in error ) err.value = error.value;
		if ( 'res' in error ) err.result = error.res;
		if ( error.stack ) err.stack = error.stack;
		res.format( {
			json: () => {
				res.status( ResultHelper.getErrorStatusCode( error ) ).send( err );
			},
			default: () => {
				res.status( ResultHelper.getErrorStatusCode( error ) ).send( err.message );
			}
		} );
		return true;
	}
	return false;
};

ResultHelper.handler = ( req, res, error, data, status ) => {
	if ( error ) {
		return ResultHelper.error( req, res, error );
	}
	else {
		return ResultHelper.finish( req, res, data, status );
	}
};

ResultHelper.getErrorStatusCode = ( error ) => {
	// check if error is usable
	if ( error instanceof Object ) {
		// check err.status
		if ( typeof error.status === 'number' && error.status >= 400 && error.status < 600 ) {
			return error.status;
		}

		// check error.statusCode
		if ( typeof error.statusCode === 'number' && error.statusCode >= 400 && error.statusCode < 600 ) {
			return error.statusCode;
		}
	}
	return 500;
};

exports.ResultHelper = ResultHelper;