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
    const [vendasData, produtosData] = await Promise.all([
      ddbDocClient.send(new ScanCommand({ TableName: vendasTableName })),
      ddbDocClient.send(new ScanCommand({ TableName: produtosTableName }))
    ]);
    
    const vendas = vendasData.Items || [];
    const produtos = produtosData.Items || [];
    
    const custosPorSku = produtos.reduce((map, produto) => {
      const custos = {
        custoProduto: produto.custo || 0,
        custoFrete: produto.custoFreteMedio || 0
      };
      if (produto.sku) {
        map[produto.sku] = custos;
      }
      if (produto.skusAntigos && Array.isArray(produto.skusAntigos)) {
        produto.skusAntigos.forEach(skuAntigo => {
          map[skuAntigo] = custos;
        });
      }
      return map;
    }, {});
    
    console.log("MAPA DE CUSTOS CRIADO:", JSON.stringify(custosPorSku, null, 2));

    const vendasEnriquecidas = vendas.map(venda => {
      let custoDosProdutos = 0;
      let custosOperacionais = 0;

      if (venda.items && Array.isArray(venda.items)) {
        
        // Primeiro, somamos os custos que são por item (custo do produto e taxa de venda)
        venda.items.forEach(item => {
          console.log(`-- Processando item com SKU: ${item.sku}`);
          const custos = custosPorSku[item.sku] || { custoProduto: 0, custoFrete: 0 };
          console.log(`-- Custos encontrados para o SKU ${item.sku}:`, custos);
          
          custoDosProdutos += custos.custoProduto * item.quantity;
          custosOperacionais += item.sale_fee || 0;
        });

        // --- AQUI ESTÁ A NOVA LÓGICA DO FRETE ---
        // Depois, adicionamos o custo do frete, que é por VENDA
        if (typeof venda.fretePersonalizado === 'number') {
          // Se existe um frete manual, ele tem prioridade
          console.log(`-- Usando Frete Personalizado para a venda ${venda.mercadoLivreId}: ${venda.fretePersonalizado}`);
          custosOperacionais += venda.fretePersonalizado;
        } else {
          // Se não, calculamos o frete médio somando o de cada item
          let freteMedioCalculado = 0;
          venda.items.forEach(item => {
            const custos = custosPorSku[item.sku] || { custoProduto: 0, custoFrete: 0 };
            freteMedioCalculado += custos.custoFrete * item.quantity;
          });
          console.log(`-- Usando Frete Médio para a venda ${venda.mercadoLivreId}: ${freteMedioCalculado}`);
          custosOperacionais += freteMedioCalculado;
        }
        // ------------------------------------------
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