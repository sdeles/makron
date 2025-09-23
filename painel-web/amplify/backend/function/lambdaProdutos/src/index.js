/* Amplify Params - DO NOT EDIT
  ENV
  REGION
Amplify Params - DO NOT EDIT */

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
  UpdateCommand
} = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = "MercadoLivreProdutos"; 

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  console.log("EVENT: \n" + JSON.stringify(event, null, 2));

  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // CORS Headers
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
  };

  try {
    switch (event.httpMethod) {
      case "GET":
        // CORREÇÃO: Usar event.pathParameters.proxy
        if (event.pathParameters && event.pathParameters.proxy) {
          body = (await ddbDocClient.send(new GetCommand({
            TableName: tableName,
            Key: { id: event.pathParameters.proxy },
          }))).Item;
        } else {
          body = (await ddbDocClient.send(new ScanCommand({ TableName: tableName }))).Items;
        }
        break;

      case "POST":
        let requestJSON = JSON.parse(event.body);
        const newId = crypto.randomUUID();
        const newItem = { id: newId, ...requestJSON };
        await ddbDocClient.send(new PutCommand({
            TableName: tableName,
            Item: newItem,
        }));
        body = newItem;
        break;
      
      case "PUT":
        // CORREÇÃO: Usar event.pathParameters.proxy
        if (!event.pathParameters || !event.pathParameters.proxy) { throw new Error("ID do produto é necessário para atualização."); }
        const updateId = event.pathParameters.proxy;
        let updateJSON = JSON.parse(event.body);
        delete updateJSON.id; 

        const updateExpression = 'SET ' + Object.keys(updateJSON).map(key => `#${key} = :${key}`).join(', ');
        const expressionAttributeNames = Object.keys(updateJSON).reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {});
        const expressionAttributeValues = Object.keys(updateJSON).reduce((acc, key) => ({ ...acc, [`:${key}`]: updateJSON[key] }), {});

        const updateData = await ddbDocClient.send(new UpdateCommand({
          TableName: tableName,
          Key: { id: updateId },
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: "ALL_NEW"
        }));
        body = updateData.Attributes;
        break;

      case "DELETE":
        // CORREÇÃO: Usar event.pathParameters.proxy
        if (!event.pathParameters || !event.pathParameters.proxy) { throw new Error("ID do produto é necessário para exclusão."); }
        await ddbDocClient.send(new DeleteCommand({
            TableName: tableName,
            Key: { id: event.pathParameters.proxy },
        }));
        body = `Deleted item ${event.pathParameters.proxy}`;
        break;
      
      default:
        throw new Error(`Unsupported method "${event.httpMethod}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = { error: err.message };
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};