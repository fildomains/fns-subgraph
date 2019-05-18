// Import types and APIs from graph-ts
import {
  ByteArray,
  crypto,
  ens,
} from '@graphprotocol/graph-ts'

// Import event types from the registry contract ABI
import { NewOwner, Transfer, NewResolver, NewTTL } from './types/ENSRegistry/EnsRegistry'

// Import entity types generated from the GraphQL schema
import { Account, Domain, Resolver } from './types/schema'

// Handler for NewOwner events
export function handleNewOwner(event: NewOwner): void {
  let account = new Account(event.params.owner.toHexString())
  account.save()

  let subnode = crypto.keccak256(concat(event.params.node, event.params.label)).toHexString()
  let domain = new Domain(subnode)

  // Get label and node names
  let label = ens.nameByHash(event.params.label.toHexString())
  if (label != null) {
    domain.labelName = label
  }

  domain.owner = account.id
  domain.parent = event.params.node.toHexString()
  domain.labelhash = event.params.label
  domain.save()
}

// Handler for Transfer events
export function handleTransfer(event: Transfer): void {
  let node = event.params.node.toHexString()

  let account = new Account(event.params.owner.toHexString())
  account.save()

  // Update the domain owner
  let domain = new Domain(node)
  domain.owner = account.id
  domain.save()
}

// Handler for NewResolver events
export function handleNewResolver(event: NewResolver): void {
  let id = event.params.resolver.toHexString().concat('-').concat(event.params.node.toHexString())
  let resolver = new Resolver(id)
  resolver.domain = event.params.node.toHexString()
  resolver.address = event.address
  resolver.save()

  let node = event.params.node.toHexString()
  let domain = new Domain(node)
  domain.resolver = id
  domain.save()
}

// Handler for NewTTL events
export function handleNewTTL(event: NewTTL): void {
  let node = event.params.node.toHexString()
  let domain = new Domain(node)
  domain.ttl = event.params.ttl
  domain.save()
}

// Helper for concatenating two byte arrays
function concat(a: ByteArray, b: ByteArray): ByteArray {
  let out = new Uint8Array(a.length + b.length)
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i]
  }
  for (let j = 0; j < b.length; j++) {
    out[a.length + j] = b[j]
  }
  return out as ByteArray
}
