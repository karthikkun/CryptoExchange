export const EVM_REVERT = 'VM Exception while processing transaction: revert'
export const ETHER = '0x0000000000000000000000000000000000000000'

export const ether = (val) => {
	return new web3.utils.BN(
		web3.utils.toWei(val.toString(), 'ether')
	).toString()
}

export const tokens = (val) => ether(val)

