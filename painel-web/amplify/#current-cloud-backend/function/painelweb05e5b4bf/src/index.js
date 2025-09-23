const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const vendasTableName = "MercadoLivreVendas";
const produtosTableName = "MercadoLivreProdutos";

exports.handler = async (event) => {
  console.log(`EVENTO INICIADO: ${JSON.stringify(event, null, 2)}`);
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
  };

  try {
    // 1. Buscar todas as vendas e produtos
    const [vendasData, produtosData] = await Promise.all([
      ddbDocClient.send(new ScanCommand({ TableName: vendasTableName })),
      ddbDocClient.send(new ScanCommand({ TableName: produtosTableName }))
    ]);
    
    const vendas = vendasData.Items || [];
    const produtos = produtosData.Items || [];
    
    // 2. Criar um mapa de SKU para CUSTOS
    const custosPorSku = produtos.reduce((map, produto) => {
      if (produto.sku) {
        map[produto.sku] = {
          custoProduto: produto.custo || 0,
          custoFrete: produto.custoFreteMedio || 0
        };
      }
      return map;
    }, {});
    
    // --- PONTO DE OBSERVAÇÃO 1 ---
    console.log("MAPA DE CUSTOS CRIADO:", JSON.stringify(custosPorSku, null, 2));

    // 3. Enriquecer cada venda com os custos corretos
    const vendasEnriquecidas = vendas.map(venda => {
      let custoDosProdutos = 0;
      let custosOperacionais = 0;

      if (venda.items) {
        venda.items.forEach(item => {
          // --- PONTO DE OBSERVAÇÃO 2 ---
          console.log(`-- Processando item com SKU: ${item.sku}`);
          
          const custos = custosPorSku[item.sku] || { custoProduto: 0, custoFrete: 0 };
          
          // --- PONTO DE OBSERVAÇÃO 3 ---
          console.log(`-- Custos encontrados para o SKU ${item.sku}:`, custos);
          
          custoDosProdutos += custos.custoProduto * item.quantity;
          custosOperacionais += item.sale_fee || 0;
          custosOperacionais += custos.custoFrete * item.quantity;
        });
      }
      
      return { 
        ...venda, 
        custoDosProdutos: custoDosProdutos,
        custosOperacionais: custosOperacionais
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(vendasEnriquecidas),
    };
  } catch (err) {
    console.error("ERRO GERAL NA FUNÇÃO:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Não foi possível buscar os dados: ' + err.message }),
    };
  }
};