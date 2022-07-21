/// <reference types="node" />

import { Request, Response } from "express-serve-static-core";

/**
 * This module provides helper functions for handling the conclusion of an express request
 */
export module ResultHelper {
	/**
	 * This method finishes a successful express request
	 *
	 * @param req - The request object from the middleware
	 * @param res - The result object from the middleware
	 * @param data - An optional data element to return (default: no data)
	 * @param status - An optional status code to return - must be between 200 and 399 (default: 200)
	 * @returns always `false`
	 */
	function finish( req: Request, res: Response, data?: any, status?: number | string ): boolean;

	/**
	 * This method conditionally finishes an unsuccessful express request
	 *
	 * Use this method to check and conditionally finish an express request. If an error
	 * is supplied, the request is finished with a suitable status code and `true` is returned.
	 * If no error is supplied, nothing will happen and `false`is returned.
	 *
	 * @param req - The request object from the middleware
	 * @param res - The result object from the middleware
	 * @param error - The error
	 * @param title - An optional title for the error (default: 'Unknown error')
	 * @returns `true` on error, `false if not`
	 */
	function error( req: Request, res: Response, error: Error | undefined, title?: string ): boolean;

	/**
	 * This method finishes an express request depending on the supplied parameters
	 *
	 * @param req - The request object from the middleware
	 * @param res - The result object from the middleware
	 * @param error - The error or undefined if no error occurred
	 * @param data - An optional data element to return (default: no data)
	 * @param status - An optional status code to return on success - must be between 200 and 399 (default: 200)
	 * @returns `true` on error, `false if not`
	 */
	function handler( req: Request, res: Response, error: Error, data?: any, status?: number | string ): boolean;

	/**
	 * Get status code from Error object.
	 *
	 * @param errror The error object to check
	 * @return The resulting HTTP status code
	 */
	function getErrorStatusCode( error: Error ): number;
}

