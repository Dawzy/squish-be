/*
	General Error class that contains:
	- message
	- statusCode
*/
class ErrorResponse extends Error {
  readonly statusCode?: number;
  
	constructor(message: string, statusCode: number) {
		super(message);
		this.statusCode = statusCode;
	}
}

export default ErrorResponse;