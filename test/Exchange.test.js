import { tokens, ether, ETHER, EVM_REVERT} from './util'

require('chai')
	.use(require('chai-as-promised'))
	.should()

const Exchange = artifacts.require('Exchange')
const Token = artifacts.require('Token')

contract('Exchange', ([deployer, feeAccount, depositor]) => {

	let token
	let exchange
	const feePercentage = 2
	let initTokens = tokens(100)

	before(async () => {
		token = await Token.new()
		exchange = await Exchange.new(feeAccount, feePercentage)
		token.transfer(depositor, initTokens, {from : deployer})
		token.approve(exchange.address, initTokens, {from : depositor})
	})

	describe('deployment', () => {

		it('tracks the fee account', async () => {
			const res = await exchange.feeAccount()
			res.should.equal(feeAccount)
		})

		it('tracks the fee percentage', async () => {
			const res = await exchange.feePercentage()
			res.toString().should.equal(feePercentage.toString())
		})
	}) 

	describe('deposit token', () => {

		let balance
		let res
		const amount = tokens(10)
		const unapprovedAmount = tokens(100000000)

		before(async () => {
			res = await exchange.depositToken(token.address, amount, {from : depositor})
		})
		describe('on success', async () => {
			it('tracks the token deposit', async () => {
				balance = await token.balanceOf(exchange.address)
				balance.toString().should.equal(amount, 'check exchange\'s token balance')
				balance = await exchange.tokens(token.address, depositor)
				balance.toString().should.equal(amount, 'check tokens on exchange')
			})

			it('emits Deposit event', async () => {
				const log = res.logs[0]
				const event = log.args
				event.token.toString().should.equal(token.address, 'token check')
				event.user.toString().should.equal(depositor, 'user check')
				event.amount.toString().should.equal(amount, 'amount check')
				event.balance.toString().should.equal(amount, 'balance check')	
			})
		})


		describe('on failure', async () => {
			it('rejects Ether deposits', async () => {
				await exchange.depositToken(ETHER, amount, {from : depositor}).should.be.rejectedWith(EVM_REVERT)
			})	

			it('rejects unapproved amount of deposits', async () => {
				await exchange.depositToken(token.address, unapprovedAmount, {from : depositor}).should.be.rejectedWith(EVM_REVERT)
			})			
		})
	
	})

	describe('deposit ether', () => {

		let balance
		let res
		const amount = ether(1)

		before(async () => {
			res = await exchange.depositEther({from : depositor, value : amount})
		})

		describe('on success', async () => {
			it('tracks ether deposit', async () => {
				balance = await exchange.tokens(ETHER, depositor)
				balance.toString().should.equal(amount, 'check ether on exchange')
			})

			it('emits Deposit event', async () => {
				const log = res.logs[0]
				const event = log.args
				event.token.toString().should.equal(ETHER, 'token check')
				event.user.toString().should.equal(depositor, 'user check')
				event.amount.toString().should.equal(amount, 'amount check')
				event.balance.toString().should.equal(amount, 'balance check')	
			})
		})
	
	})

	describe('fallback' , () => {
		it('reverts directly sent ether', async () => {
			await exchange.sendTransaction({value : ether(1), from : depositor}).should.be.rejectedWith(EVM_REVERT)
		})
	})


	describe('withdraw token', () => {

		let balance
		let res
		const amount = tokens(10)
		const invalidAmount = tokens(100000000)

		before(async () => {
			res = await exchange.withdrawToken(token.address, amount, {from : depositor})
		})
		describe('on success', async () => {
			it('withdraws tokens', async () => {
				balance = await token.balanceOf(exchange.address)
				balance.toString().should.equal(tokens(0), 'check exchange\'s token balance')
				balance = await token.balanceOf(depositor)
				balance.toString().should.equal(initTokens, 'check user token balance')
				balance = await exchange.tokens(token.address, depositor)
				balance.toString().should.equal(tokens(0), 'check tokens on exchange')
			})

			it('emits Withdraw event', async () => {
				const log = res.logs[0]
				const event = log.args
				event.token.toString().should.equal(token.address, 'token check')
				event.user.toString().should.equal(depositor, 'user check')
				event.amount.toString().should.equal(amount, 'amount check')
				event.balance.toString().should.equal(tokens(0), 'balance check')	
			})
		})


		describe('on failure', async () => {
			it('rejects withdrawal beyond balance', async () => {
				await exchange.withdrawToken(token.address, invalidAmount, {from : depositor}).should.be.rejectedWith(EVM_REVERT)
			})

			it('rejects Ether withdrawal', async () => {
				await exchange.withdrawToken(ETHER, amount, {from : depositor}).should.be.rejectedWith(EVM_REVERT)
			})
		})
	
	})

	describe('withdraw ether', () => {

		let balance
		let res
		const amount = ether(1)
		const invalidAmount = ether(1000000000000)

		before(async () => {
			res = await exchange.withdrawEther(amount, {from : depositor})
		})

		describe('on success', async () => {
			it('withdraws ether', async () => {
				balance = await exchange.tokens(ETHER, depositor)
				balance.toString().should.equal(ether(0), 'check ether on exchange')
			})

			it('emits Withdraw event', async () => {
				const log = res.logs[0]
				const event = log.args
				event.token.toString().should.equal(ETHER, 'token check')
				event.user.toString().should.equal(depositor, 'user check')
				event.amount.toString().should.equal(amount, 'amount check')
				event.balance.toString().should.equal(ether(0), 'balance check')	
			})
		})

		describe('on failure', async () => {
			it('rejects withdrawal beyond balance', async () => {
				await exchange.withdrawEther(invalidAmount, {from : depositor}).should.be.rejectedWith(EVM_REVERT)
			})
		})
	
	})


	describe('balanceOf', () => {

		const amount = ether(1)
		before(async () => {
			await exchange.depositEther({from : depositor, value : amount}) 
		})

		it('returns balance', async () => {
			const res = await exchange.balanceOf(ETHER, depositor)
			res.toString().should.equal(amount)
		})

	})


})