# ENS Subgraph

This Subgraph sources two events from the ENS Registry, at the address on mainnnet at `0x314159265dd8dbb310642f98f50c066173c1259b`. The two events that emit events are:

- `setOwner(bytes32 node, address owner)`
  - which emits `Transfer(node, owner)`
  - This event indicates when an ens subdomain has changed ownership
- `setSubnodeOwner(bytes32 node, bytes32 label, address owner)`
  - which emits `NewOwner(node, label, owner)`
  - This event indicated when any ens domain has been registered

Contract events can be seen here: https://github.com/ensdomains/ens/blob/master/contracts/ENSRegistry.sol

The ABI was taken from https://etherscan.io/address/0x314159265dd8dbb310642f98f50c066173c1259b#code

Whenever the `Transfer` events and `NewOwner` events are emitted, the Graph Node will store this value as an entity `EnsDomain`. It processes blocks in ascending order. `setOwner()` will be stored as a new entity `Tranfer`. `setOwner()` will also update the owner attritbute of the `EnsDomain` entity the transfer is associated with. 

This subgraph has `keccak-256` (a.k.a `sha3` on Ethereum) which is native Rust code, which the WASM code calls out to, and therefore can be used with mappings. This is needed because the event `setSubnodeOwner` does not emit the actual domain hash, it emits two `bytes32` values that are then used with `sha3(node, label)` to create the domain hash. More detail can be found by reading into the [namehash alogorithm](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-137.md). This allows for all domains to be stored in the subgraph with their unique `id` as the domain hash. 

## Graph Node Information

The graph node can source events by calling into Infura through http or websocket calls. It can also connect to your own geth node or parity node. Fast synced geth nodes also work if you have to start one from scratch. Having your own node is more reliable and quicker, as sometimes Infura returns errors outside of our control. But Infura is the quickest way to start up the graph node, if you don't already have a fully synced geth node.  

This subgraph has three files which tell the node to source the two ENS events specified above. They are:
* The subgraph manifest (subgraph.yaml)
* A GraphQL schema      (schema.graphql)
* A mapping script      (EnsRegistrar.ts)

These files are all written and complete in this repository. If you want to read about how to modify these files yourself, please check out https://github.com/graphprotocol/graph-node/blob/master/docs/getting-started.md. 



The first 3327420 blocks will be skipped, as the ENS contracts did not exist on mainnet before this. Then it will take a while. The ENS contracts were highly active upon launch, and less active as of late. The whole thing took about 7 hours on a 2017 Macbook Pro. 


We have provided quick steps on how to start up the ENS-Subgraph graph node below. If these steps aren't descriptive enough, the [Getting started](https://github.com/graphprotocol/graph-node/blob/master/docs/getting-started.md) document has in depth details that should help. 

## Steps to get the ENS-Subgraph Running 
  1. Install IPFS and run `ipfs init` followed by `ipfs daemon`
  2. Install PostgreSQL and run `initdb -D .postgres` followed by `createdb ens-subgraph`
  3. If using Ubuntu, you may need to install additional packages: `sudo apt-get install -y clang libpq-dev libssl-dev pkg-config`
  4. Clone this repository, bulid it with `yarn install`, `yarn codegen` and `yarn build-ipfs`. Get the Subgraph ID output that starts with `Qm`, you will need this for step 6
  5. Clone https://github.com/graphprotocol/graph-node from master and `cargo build`
  6. Now that all the dependencies are running, you can run the following command to connect to Infura:

```
  cargo run -p graph-node --release -- \
  --postgres-url postgresql://USERNAME:[PASSWORD]@localhost:5432/ens-subgraph \
  --ethereum-ws mainnet:wss://mainnet.infura.io/_ws \
  --ipfs 127.0.0.1:5001 \
  --subgraph <SUBGRAPH_NAME>:<SUBGRAPHID FROM STEP 4>
```

  7. Or you can run the following command to connect to a local geth node with rpc option on: 

```
  cargo run -p graph-node --release -- \
  --postgres-url postgresql://USERNAME@localhost:5432/ens-subgraph \
  --ethereum-rpc mainnet:http://127.0.0.1:8545 \
  --ipfs 127.0.0.1:5001 \
  --subgraph <SUBGRAPH_NAME>:<SUBGRAPHID FROM STEP 4>
```

Once you have built the subgraph and started a Graph Node you may open a [Graphiql](https://github.com/graphql/graphiql) browser at `127.0.0.1:8000` and get started with querying.

## Getting started with Querying 

See the query API here: https://github.com/graphprotocol/graph-node/blob/master/docs/graphql-api.md 

Below are three ways to show how to query the ENS Subgraph for intesting data. 

### Finding all the subdomains of a domain
This comes in handy when you know what the domain is, and you want to see how many subdomains it has. The domain `0x91d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2` is the
`addr.reverse` domain. When you query this, you can see how many domains have been registered in the reverse lookup. Type this command into the Graphiql browser at `127.0.0.1:8000`:

```
{
  ensDomains(where: {node_contains: "0x91d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2"}) {
    id
    label
    node
    owner
    transfers
  }
}
```

### Finding all the domains that one Ethereum Account Owns

This comes in handy when there is a user who has registered potentially 100's of names, but can't remember them all. Simply filter by owner, and all of their purchases will be shown.

```
{
  ensDomains(where: {owner_contains: "0xc73C21952577366A0fBfD62B461Aeb5305801157"}) {
    id
    label
    node
    owner
    transfers
  }
}
```

Querying this account will show that it owns many domains. You can double check on etherscan, and see that this is an active ens registrar account https://etherscan.io/address/0xc73C21952577366A0fBfD62B461Aeb5305801157
