// index.js
const axios = require('axios');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

// Configuração dos clientes AWS
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Pegue estas variáveis do ambiente da Lambda
const ML_APP_ID = process.env.ML_APP_ID;
const ML_SECRET_KEY = process.env.ML_SECRET_KEY;
const TABLE_NAME = process.env.TABLE_NAME;

// Função principal que a Lambda executa
exports.handler = async (event) => {
    console.log("Notificação recebida do ML:", event.body);

    try {
        const notification = JSON.parse(event.body);

        // 1. Apenas processar notificações de pedidos
        if (notification.topic === 'orders_v2') {
            console.log(`Processando notificação para o recurso: ${notification.resource}`);

            // 2. Obter o token de acesso do Mercado Livre
            const accessToken = await getMLAccessToken();

            // 3. Buscar os detalhes completos do pedido
            const orderDetails = await getOrderDetails(notification.resource, accessToken);
            
            // 4. Salvar os detalhes no DynamoDB
            await saveOrderToDynamoDB(orderDetails);
            
            console.log(`Pedido ${orderDetails.id} salvo com sucesso!`);
        } else {
            console.log(`Tópico '${notification.topic}' ignorado.`);
        }

        // 5. Responder 200 OK para o Mercado Livre saber que recebemos
        return { statusCode: 200, body: 'Notificação recebida.' };

    } catch (error) {
        console.error("Erro ao processar notificação:", error.message, error.stack);
        // Em caso de erro, ainda respondemos 200 para evitar retentativas do ML,
        // mas o erro ficará registrado no CloudWatch para análise.
        return { statusCode: 200, body: 'Erro no processamento, verifique os logs.' };
    }
};

// Função para obter um token de acesso do ML
async function getMLAccessToken() {
    const url = 'https://api.mercadolibre.com/oauth/token';
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', ML_APP_ID);
    params.append('client_secret', ML_SECRET_KEY);

    const response = await axios.post(url, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log("Token de acesso do ML obtido.");
    return response.data.access_token;
}

// Função para buscar os detalhes do pedido na API do ML
async function getOrderDetails(resourceUrl, accessToken) {
    const url = `https://api.mercadolibre.com${resourceUrl}`;
    const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    console.log(`Detalhes do pedido ${response.data.id} obtidos.`);
    return response.data;
}

// Função para salvar os dados no DynamoDB
async function saveOrderToDynamoDB(orderDetails) {
    const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            mercadoLivreId: String(orderDetails.id), // Chave primária
            status: orderDetails.status,
            date_created: orderDetails.date_created,
            total_amount: orderDetails.total_amount,
            currency_id: orderDetails.currency_id,
            buyer: {
                id: orderDetails.buyer.id,
                nickname: orderDetails.buyer.nickname,
            },
            items: orderDetails.order_items.map(item => ({
                id: item.item.id,
                title: item.item.title,
                quantity: item.quantity,
                unit_price: item.unit_price,
                sku: item.item.seller_sku
            })),
            last_updated: new Date().toISOString()
        },
    });
    await docClient.send(command);
}