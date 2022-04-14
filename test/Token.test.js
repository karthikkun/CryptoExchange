import { tokens, EVM_REVERT} from './util'

require('chai')
	.use(require('chai-as-promised'))
	.should()

const Token = artifacts.require('Token')

contract('Token', ([deployer, receiver]) => {

	let token

	describe('deployment', () => {
		const name = 'WCoin'
		const symbol = 'WCO'
		const totalSupply = tokens(1000000)
		const decimals = '18'

		before(async () => {
			token = await Token.new()
		})

		it('tracks the token name', async () => {
			const res = await token.name()
			res.should.equal(name)
		})

		it('tracks the token symbol', async () => {
			const res = await token.symbol()
			res.should.equal(symbol)
		})

		it('tracks the token decimals', async () => {
			const res = await token.decimals()
			res.toString().should.equal(decimals)
		})

		it('tracks the total token supply', async () => {
			const res = await token.totalSupply()
			res.toString().should.equal(totalSupply)
		})

		it('assigns total supply to the deployer', async () => {
			const res = await token.balanceOf(deployer)
			res.toString().should.equal(totalSupply)
		})
	})

	describe('sending tokens', () => {

		let txnResult
		const sender = deployer
		const amount = tokens(100)
		const invalidAmount = tokens(10000000000)

		describe('on success', () => {
			before(async () => {
				txnResult = await token.transfer(receiver, amount, {from : sender})
			})

			it('updates sender and receiver balance', async () => {
				let balanceOfSender = await token.balanceOf(sender)
				let balanceOfReceiver = await token.balanceOf(receiver)

				balanceOfSender.toString().should.equal(tokens(999900))
				balanceOfReceiver.toString().should.equal(tokens(100))
			})

			it('emits a transfer event', async () => {
				const log = txnResult.logs[0]
				log.event.should.equal('Transfer', 'event type check')

				const event = log.args
				event.from.toString().should.equal(sender, 'from address check')
				event.to.toString().should.equal(receiver, 'to address check')
				event.value.toString().should.equal(amount, 'value check')
			})
		})

		describe('on failure', () => {
			it('fails the transaction in case of insufficient balance', async () => {
				await token.transfer(receiver, invalidAmount, {from : sender}).should.be.rejectedWith(EVM_REVERT)
			})

			it('rejects an invalid recipient', async () => {
				await token.transfer(0x0, amount, {from : sender}).should.be.rejected
			})
		})
		
	})
})
