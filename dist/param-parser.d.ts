/// <reference types="node" />

import { RequestHandler } from "express-serve-static-core";

/**
 * A function that parses the properties of an object
 * returning the resulting object based on certain criteria
 *
 * @param params The object to parse
 * @returns The parsed object
 * @throws A {@link HttpStatusError} in case of error
 */
export type ParserFunction = ( params: Object ) => Object;

/**
 * Options passed to a ParamParser
 *
 * @property methods - An optional array or comma separated list of allowed methods (no default: all methods allowed)
 * @property merge - An optional array or comma separated list describing the merge strategy for parameters (default: merge all -> params, query, body)
 * @property errormode - Defines how to handle errors: with `exception` an exception is thrown and the handling is done by express, with `handle` the result is handled internally using a `resultHelper`, with `param` the error information is returned in `res.params` (default: exception)
 * @property errortitle - Alternative title of the error in response if any error occurs (default: none)
 * @property stringify - An optional array or comma separated list of parametres to JSON.stringify (default: empty)
 */
export interface ParserOptions {
	methods?: string | string[],
	merge?: string | string[],
	errormode?: 'exception' | 'handle' | 'param',
	errortitle?: string,
	stringify?: boolean
}

/**
 * Consolidated options passed to handlers like transformers, validators, etc.
 *
 * @property methods - An array of allowed methods. If array is empty, all methods are allowed
 * @property merge - An array describing the merge strategy for parameters
 * @property errormode - Defines how to handle errors: with `exception` an exception is thrown and the handling is done by express, with `handle` the result is handled internally using a `resultHelper`, with `param` the error information is returned in `res.params`
 * @property errortitle - Alternative title of the error in response if any error occurs
 * @property stringify - An array of parametres to JSON.stringify
 */
export interface ConsolidatedParserOptions {
	methods: string[],
	merge: string[],
	errormode: 'exception' | 'handle' | 'param',
	errortitle?: string,
	stringify: boolean
}

/**
 *
 */
export class ParamParser {
	readonly options: ConsolidatedParserOptions;

	/**
	 * Creates a new ParamParser instance.
	 *
	 * @param options { @link ParserOptions } of the ParamParser
	 */
	constructor( options: ParserOptions );

	/**
	* Creates an express middleware that process and returns all parameters
	*
	* @param keydefinition An optional array or comma separated list describing which parameters are mandatory
	*/
	all( keydefinition?: string | string[] ): RequestHandler;

	/**
	 * Creates an express middleware that process and returns only the specified parameters
	 *
	 * @param keydefinition An array or comma separated list describing which parameters will be returned. By addint an `!` at the end of the parameter name, the parameter will be mandatory.
	 */
	only( keydefinition: string | string[] ): RequestHandler;

	/**
	 * Creates a parser function that process and returns all parameters
	 *
	 * @param keydefinition An optional array or comma separated list describing which parameters are mandatory
	 */
	allParser( keydefinition?: string | string[] ): ParserFunction;

	/**
	 * Creates a parser function that process and returns only the specified parameters
	 *
	 * @param keydefinition An array or comma separated list describing which parameters will be returned. By addint an `!` at the end of the parameter name, the parameter will be mandatory.
	 */
	parseOnly( keydefinition: string | string[] ): ParserFunction;

	/**
	 * Adds a requirer function to the parameter parser
	 *
	 * A requirer function checks if the resulting parameter meets certain requisites.
	 * If not, a {@link HttpStatusError} is thrown.
	 *
	 * @param name An array or comma separated list of parameter names
	 * @param requirer Requirer function to attach
	 */
	setRequirer( name: string | string[], requirer: ( params: Object, property: string, options: ConsolidatedParserOptions ) => void ): void;

	/**
	 * Adds a validator function to the parameter parser
	 *
	 * A validator function checks if the passed parameter meets certain criteria.
	 * If not, a {@link HttpStatusError} is thrown.
	 *
	 * @param name An array or comma separated list of parameter names
	 * @param validator Validator function to attach
	 */
	setValidator( name: string | string[], validator: ( params: Object, property: string, options: ConsolidatedParserOptions ) => void ): void;

	/**
	 * Adds a transformer function to the parameter parser
	 *
	 * A validator function checks if the passed parameter meets certain criteria.
	 * If not, a {@link HttpStatusError} is thrown.
	 *
	 * @param name An array or comma separated list of parameter names
	 * @param transformer Transformer function to attach
	 */
	setTransformer( name: string | string[], transformer: ( params: Object, property: string, options: ConsolidatedParserOptions ) => void ): void;
}