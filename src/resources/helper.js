export const ETHER = '0x0000000000000000000000000000000000000000'
export const ETHER_SYMBOL = 'ETH'
export const DECIMALS = (10**18)

export const ether = (wei) => (wei / DECIMALS)
export const tokens = ether


export const RED = 'danger'
export const GREEN = 'success'
export const BUY = 'buy'
export const SELL = 'sell'
