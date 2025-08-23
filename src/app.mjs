import priorityAgent from "./functions/priorities-agent.mjs";

export const lambdaHandler = async (event, context) => {
  // handle cors options
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "CORS options" }),
    };
  }

  // handle post request
  if (event.httpMethod === "POST") {
    const requestBody = JSON.parse(event.body);
    const priorityAgentResponse = await priorityAgent(requestBody);
    return priorityAgentResponse;
  }

  // handle get request
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Hello World" }),
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ message: "Method not allowed" }),
  };
};
