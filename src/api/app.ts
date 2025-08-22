import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Handle OPTIONS request for CORS preflight
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers':
                        'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                },
                body: '',
            };
        }

        // Handle POST request
        if (event.httpMethod === 'POST') {
            let requestBody = {};

            // Parse the request body if it exists
            if (event.body) {
                try {
                    requestBody = JSON.parse(event.body);
                } catch (parseError) {
                    return {
                        statusCode: 400,
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message: 'Invalid JSON in request body',
                            error: parseError instanceof Error ? parseError.message : 'Unknown error',
                        }),
                    };
                }
            }

            // Process the POST request
            console.log('Received POST request with body:', requestBody);

            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'POST request received successfully',
                    receivedData: requestBody,
                    timestamp: new Date().toISOString(),
                }),
            };
        }

        // Handle unsupported methods
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Method not allowed. Only POST requests are supported.',
            }),
        };
    } catch (err) {
        console.log('Error:', err);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Internal server error',
                error: err instanceof Error ? err.message : 'Unknown error',
            }),
        };
    }
};
