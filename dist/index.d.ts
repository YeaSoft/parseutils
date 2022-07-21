/// <reference types="node" />

// export { resultHelper, paramParser };

// import resultHelper = require( "./result-helper.js" );
// import paramParser = require( "./param-parser.js" );


import { HttpStatusError } from '@yeasoft/fetchutils';
import { ParamParser, ParserOptions, ConsolidatedParserOptions } from './param-parser';
import { ResultHelper } from './result-helper';

export {
	HttpStatusError,
	ParamParser, ParserOptions, ConsolidatedParserOptions,
	ResultHelper,
};
