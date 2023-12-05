import * as supertest from "supertest";
import { HttpStatus } from "@nestjs/common";

/**
 * <p>A helper method which asserts if a response returned the expected http status code.</p>
 * <p>If the response http status code does not match the expected one -- it will throw an error with additional
 * information for easier debugging.</p>
 *
 * <p>NOTE: If you happen to see an 500 Internal Server Error with no logs you might want to configure logging via:</p>
 * <pre>
 * <code>
 * app = moduleRef.createNestApplication(undefined, {logger: [ -> "verbose" <- ] })
 * </code>
 * </pre>
 *
 * @param response
 * @param expectedStatus
 * @param expectedContentType The expected content type (i.e. application/json; charset=utf-8)
 */
export function assertHttpResponse(response: supertest.Response,
                                   expectedStatus: any = 200,
                                   expectedContentType?: string): supertest.Response
{

    let result = true;

    if(response.status !== expectedStatus) {
        result = false;
    }
    if(expectedContentType && response.headers['content-type'] !== expectedContentType) {
        result = false;
    }

    if(result) {
        return response;
    }

    // Display error and debugging information.
    const error = response.error;
    const reqData = JSON.parse(JSON.stringify(response)).req;
    throw new Error(` 
  ${error}

  request-method  : ${JSON.stringify(reqData.method)} 
  request-url     : ${JSON.stringify(reqData.url)}
  request-data    : ${JSON.stringify(reqData.data)}
  request-headers : ${JSON.stringify(reqData.headers)}
  response-status : got ${JSON.stringify(response.status)}, expected ${expectedStatus}
  response-body   : ${JSON.stringify(response.body)}

  `);

}

export function assertHttpResponseContainsHeader(response: supertest.Response, key: string, value?: string) {

    key = key.toLowerCase(); // response headers are in lower case.

    let error: string|null = null;

    if(response.headers === undefined || response.headers === null || response.headers === "" || response.headers.length === 0) {
        error = `Expected to find ${key} in headers, but headers were empty!`
    }

    if(!response.headers.hasOwnProperty(key)) {
        error = `Expected to find ${key} in headers, but headers did not contain that key!`
    }

    const headerValue = response.headers[key]
    if(headerValue === "" || headerValue === null || (value && !`${headerValue}`.includes(value))) {
        error = `Expected to find ${key} in headers that contains value ${value}, but found ${headerValue}!`
    }

    // No errors - we're good to go.
    if(error === null) {
        return;
    }

    // Display error and debugging information.
    const reqData = JSON.parse(JSON.stringify(response)).req;

    throw new Error(` 
  ${error}

  request-method  : ${JSON.stringify(reqData.method)} 
  request-url     : ${JSON.stringify(reqData.url)}
  request-data    : ${JSON.stringify(reqData.data)}
  request-headers : ${JSON.stringify(reqData.headers)}
  response-headers : ${JSON.stringify(response.headers)}

  `);
}

/**
 * Asserts the returned response an Error message of some kind.
 * @param response
 * @param expectedStatus
 * @param expectedMessage
 * @param expectedContentType
 */
export function assertErrorResponse(response: supertest.Response, expectedStatus: HttpStatus = 400, expectedMessage?: string, expectedContentType?: string)
{

    // Assert http response
    assertHttpResponse(response, expectedStatus, expectedContentType);

    // Assert response payload
    const responsePayload: any = response.body;
    expect(responsePayload !== null).toBeTruthy()
    expect(responsePayload.statusCode).toEqual(expectedStatus)
    expect(responsePayload.message).toEqual(expectedMessage);

}

/**
 * <p>Asserts the returned response contains a 404 error message.</p>
 *
 * @param response
 * @param expectedMessage
 * @param expectedContentType
 */
export function assert404Response(response: supertest.Response, expectedMessage: string, expectedContentType?: string)
{
    assertErrorResponse(response, HttpStatus.NOT_FOUND, expectedMessage, expectedContentType);
}
