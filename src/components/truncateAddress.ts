export function truncateEthAddress(address: string, digits = 6) {
  if (address.length <= digits * 2) {
    return address
  } else {
    return address.slice(0, digits) + '...' + address.slice(-digits)
  }
}
