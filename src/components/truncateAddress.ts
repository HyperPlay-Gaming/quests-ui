export function truncateEthAddress(address: string, digits = 5) {
  if (address.length <= digits * 2) {
    return address
  } else {
    return address.slice(0, digits + 2) + '...' + address.slice(-digits)
  }
}
