const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = "MercadoLivreVendas";

exports.handler = async (event) => {
  console.log(`EVENTO DE ATUALIZAÇÃO: ${JSON.stringify(event)}`);

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "OPTIONS,PUT",
  };

  if (event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: `Apenas o método PUT é aceito.` }),
    };
  }

  try {
    // --- AQUI ESTÁ A CORREÇÃO ---
    // A API envia o ID no final do path. Esta é a forma correta de extraí-lo.
    const vendaId = event.path.split('/').pop();
    // -----------------------------

    const requestJSON = JSON.parse(event.body);
    const fretePersonalizado = requestJSON.fretePersonalizado;

    let params;

    if (fretePersonalizado === null) {
      console.log(`Pedido de remoção do frete para a venda: ${vendaId}`);
      params = {
        TableName: tableName,
        Key: { mercadoLivreId: vendaId }, // Garantindo que o nome da chave está correto
        UpdateExpression: "REMOVE fretePersonalizado",
        ReturnValues: "UPDATED_NEW",
      };
    } else if (typeof fretePersonalizado === 'number') {
      console.log(`Pedido de atualização do frete para ${fretePersonalizado} na venda: ${vendaId}`);
      params = {
        TableName: tableName,
        Key: { mercadoLivreId: vendaId }, // Garantindo que o nome da chave está correto
        UpdateExpression: "SET fretePersonalizado = :f",
        ExpressionAttributeValues: { ":f": fretePersonalizado },
        ReturnValues: "UPDATED_NEW",
      };
    } else {
      throw new Error("O valor de 'fretePersonalizado' é inválido.");
    }

    console.log("PARÂMETROS ENVIADOS PARA O DYNAMODB:", JSON.stringify(params, null, 2));
    const data = await ddbDocClient.send(new UpdateCommand(params));

    console.log("Sucesso:", data.Attributes);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data.Attributes || {}),
    };
  } catch (err) {
    console.error("ERRO AO ATUALIZAR VENDA:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Não foi possível atualizar a venda: ' + err.message }),
    };
  }
};