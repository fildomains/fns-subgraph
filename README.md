# FNS graph node
    https://github.com/graphprotocol/graph-node    

This Subgraph sources events from the FNS contracts. This includes the FNS registry, the Auction Registrar, and any resolvers that are created and linked to domains. The resolvers are added through dynamic data sources. More information on all of this can be found at [The Graph Documentation](https://thegraph.com/docs/developer/quick-start/).

# hardhat network test setup
    Create the postgresql database named: graphnode

    Compile and run graphnode:
    git clone --branch Branch_v0.25.0 https://github.com/graphprotocol/graph-node.git
    cd graph-node
    cargo build
    cd target/debug/
    ./graph-node  --postgres-url postgresql://postgres:postgres@localhost:5432/graphnode --ethereum-rpc hardhat:http://localhost:8545  --ipfs localhost:5001

    run hardhat node:
    git clone https://github.com/fildomains/fns-contracts
    cd fns-contracts
    yarn
    yanr run node

    git clone --branch hardhat https://github.com/fnsdomains/fns-subgraph
    cd fns-subgraph
    yarn
    yarn setup

# branchs and networks

    network             branch
    hardhat             hardhat

# Example Queries

Here we have example queries, so that you don't have to type them in yourself eachtime in the graphiql playground:

```graphql
{
  domains {
    id
    labelName
    labelhash
    parent {
      id
    }
    subdomains {
      id
    }
    owner {
      id
    }
    resolver {
      id
    }
    ttl
  }
  resolvers {
    id
    address
    domain {
      id
    }
    events {
      id
      node
      ... on AddrChanged {
        a
      }
      ... on NameChanged {
        name
      }
      ... on AbiChanged {
        contentType
      }
      ... on PubkeyChanged {
        x
        y
      }
      ... on TextChanged {
        indexedKey
        key
      }
      ... on ContenthashChanged {
        hash
      }
      ... on InterfaceChanged {
        interfaceID
        implementer
      }
      ... on AuthorisationChanged {
        owner
        target
        isAuthorized
      }
    }
  }
  registrations(where: { labelName_not: null }, orderBy: expiryDate, orderDirection: asc, first: 10, skip: 0) {
    expiryDate
    labelName
    domain{
      name
      labelName
    }
  }
}

```
