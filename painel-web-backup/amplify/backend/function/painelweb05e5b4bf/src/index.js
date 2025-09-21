/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

// Importe o SDK do DynamoDB V3
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

// Configure o cliente do DynamoDB
const client = new DynamoDBClient({ region: process.env.REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);

// O nome da nossa tabela do DynamoDB
const tableName = "MercadoLivreVendas";

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    const params = {
        TableName: tableName,
    };

    try {
        console.log("Tentando escanear a tabela:", tableName);
        const data = await ddbDocClient.send(new ScanCommand(params));
        console.log("Sucesso! Itens encontrados:", data.Items.length);

        return {
            statusCode: 200,
            // Adicione os headers de CORS aqui para permitir o acesso do seu frontend
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify(data.Items),
        };
    } catch (err) {
        console.error("Erro ao escanear a tabela:", err);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ error: 'Could not load items: ' + err.message }),
        };
    }
};