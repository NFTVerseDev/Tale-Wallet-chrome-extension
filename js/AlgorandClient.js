

const token = "ef920e2e7e002953f4b29a8af720efe8e4ecc75ff102b165e0472834b25832c1";
const server = "https://testnet-api.algonode.cloud";
const port = 443;

// algod client
const AlgorandClient = new algosdk.Algodv2(token, server, port);
// const indexerClient = new algosdk.Indexer(token, server, port);
export default AlgorandClient