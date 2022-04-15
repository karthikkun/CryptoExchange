import { tokens, EVM_REVERT} from './util'

require('chai')
	.use(require('chai-as-promised'))
	.should()

const Token = artifacts.require('Token')

contract('Token', ([deployer, receiver, exchange]) => {

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

			after(async () => {
				txnResult = await token.transfer(sender, amount, {from : receiver})
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

	describe('approving tokens', () => {
		let txnResult
		let amount
		const owner = deployer

		describe('on success', () => {
			before(async () => {
				amount = tokens(100)
				txnResult = await token.approve(exchange, amount, {from : owner})
			})

			it('allocates an allowance for delegated token spending on an exchange', async () => {
				const allowance = await token.allowance(owner, exchange)
				allowance.toString().should.equal(amount)
			})

			it('emits an approve event', () => {
				const log = txnResult.logs[0]
				const event = log.args
				event.owner.should.equal(owner, 'owner is correct')
				event.spender.should.equal(exchange, 'spender is correct')
				event.value.toString().should.equal(amount)
			})
		})

		describe('on failure', () => {
			it('rejects invalid spenders', async () => {
				await token.approve(0x0, amount, {from : owner}).should.be.rejected
			})
		})
	})

	describe('delegated token transfers', () => {

		let txnResult
		const sender = deployer
		const amount = tokens(100)
		const invalidAmount = tokens(10000000000)
		
		before(async () => {
			await token.approve(exchange, amount, {from : sender})
		})

		describe('on success', () => {
			before(async () => {
				txnResult = await token.transferFrom(sender, receiver, amount, {from : exchange})
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

			it('updates the allowance on the exchange', async () => {
				const allowance = await token.allowance(sender, exchange)
				allowance.toString().should.equal(amount)
			})
		})

		describe('on failure', () => {
			it('fails the transaction in case of insufficient balance or, non delegated token transfer', async () => {
				await token.transferFrom(sender, receiver, invalidAmount, {from : exchange}).should.be.rejectedWith(EVM_REVERT)
			})

			it('rejects invalid recipients', async () => {
				await token.transferFrom(sender, 0x0, amount, {from : exchange}).should.be.rejected
			})
		})
		
	})
})
