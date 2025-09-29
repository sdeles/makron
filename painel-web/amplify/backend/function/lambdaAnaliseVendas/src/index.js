const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
// Importamos mais funções da biblioteca de datas
const { parseISO, eachDayOfInterval, format } = require("date-fns");

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const vendasTableName = process.env.VENDAS_TABLE;

exports.handler = async (event) => {
  console.log(`EVENTO DE ANÁLISE: ${JSON.stringify(event)}`);
  
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
  };

  try {
    // 1. Aceita startDate e endDate em vez de year/month
    const startDateParam = event.queryStringParameters?.startDate;
    const endDateParam = event.queryStringParameters?.endDate;

    if (!startDateParam || !endDateParam) {
      throw new Error("Os parâmetros 'startDate' e 'endDate' são obrigatórios.");
    }

    const startDate = parseISO(startDateParam);
    const endDate = parseISO(endDateParam);

    console.log(`Buscando vendas entre ${startDate.toISOString()} e ${endDate.toISOString()}`);

    const scanParams = {
      TableName: vendasTableName,
      FilterExpression: "date_created BETWEEN :start AND :end",
      ExpressionAttributeValues: {
        ":start": startDate.toISOString(),
        ":end": endDate.toISOString(),
      },
    };

    let allItems = [];
    let lastEvaluatedKey;
    do {
        scanParams.ExclusiveStartKey = lastEvaluatedKey;
        const scanResult = await ddbDocClient.send(new ScanCommand(scanParams));
        if(scanResult.Items) {
            allItems = allItems.concat(scanResult.Items);
        }
        lastEvaluatedKey = scanResult.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    // 2. Pré-agrupa os dados por dia
    const vendasAgrupadas = allItems.reduce((acc, venda) => {
      // Usamos AAAA-MM-DD como chave para garantir a ordenação correta
      const diaKey = format(new Date(venda.date_created), 'yyyy-MM-dd');
      if (!acc[diaKey]) {
        acc[diaKey] = { valor: 0, quantidade: 0 };
      }
      acc[diaKey].valor += venda.total_amount;
      acc[diaKey].quantidade += 1; // Soma a quantidade de vendas
      return acc;
    }, {});
    
    // 3. Gera todos os dias no intervalo e preenche os "buracos"
    const todosOsDias = eachDayOfInterval({ start: startDate, end: endDate });

    const labels = [];
    const valorData = [];
    const quantidadeData = [];

    todosOsDias.forEach(diaObj => {
        const diaKey = format(diaObj, 'yyyy-MM-dd');
        const diaLabel = format(diaObj, 'dd/MM');
        
        labels.push(diaLabel);
        if (vendasAgrupadas[diaKey]) {
            valorData.push(vendasAgrupadas[diaKey].valor);
            quantidadeData.push(vendasAgrupadas[diaKey].quantidade);
        } else {
            valorData.push(0); // Preenche com zero se não houve venda
            quantidadeData.push(0);
        }
    });

    // 4. Retorna um objeto completo com todos os dados que o frontend precisa
    const finalData = {
        labels: labels,
        datasets: {
            valor: valorData,
            quantidade: quantidadeData
        }
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(finalData),
    };

  } catch (err) {
    console.error("ERRO NA ANÁLISE:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Não foi possível analisar os dados: ' + err.message }),
    };
  }
};