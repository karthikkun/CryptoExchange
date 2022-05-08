import { tokens, ether, ETHER, EVM_REVERT} from './util'

require('chai')
	.use(require('chai-as-promised'))
	.should()

const Exchange = artifacts.require('Exchange')
const Token = artifacts.require('Token')

contract('Exchange', ([deployer, feeAccount, depositor, otherUser, tempUser]) => {

	let token
	let exchange
	const feePercentage = 10
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

	describe('order actions', () => {

		before(async () => {
			await exchange.depositEther({from : depositor, value : ether(1)})
			await token.transfer(otherUser, tokens(100), {from : deployer})
			await token.approve(exchange.address, tokens(2), {from : otherUser})
			await exchange.depositToken(token.address, tokens(2), {from : otherUser})
		})

		describe('making orders', () => {
			let res
			before(async () => {
				res = await exchange.makeOrder(token.address, tokens(1), ETHER, ether(1), {from : depositor}) 
			})

			it('tracks the newly created order', async () => {
				const orderCount = await exchange.orderCount()
				orderCount.toString().should.equal('1')
				const order = await exchange.orders(orderCount)
				order.id.toString().should.equal('1', 'id is correct')
				order.user.toString().should.equal(depositor, 'user is correct')
				order.tokenGet.toString().should.equal(token.address, 'tokenGet is correct')
				order.amountGet.toString().should.equal(tokens(1), 'amountGet is correct')
				order.tokenGive.toString().should.equal(ETHER, 'tokenGive is correct')
				order.amountGive.toString().should.equal(ether(1), 'amountGive is correct')
				order.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
			})

			it('emits Order event', async () => {
				const log = res.logs[0]
				const event = log.args
				event.id.toString().should.equal('1', 'id is correct')
				event.user.toString().should.equal(depositor, 'user is correct')
				event.tokenGet.toString().should.equal(token.address, 'tokenGet is correct')
				event.amountGet.toString().should.equal(tokens(1), 'amountGet is correct')
				event.tokenGive.toString().should.equal(ETHER, 'tokenGive is correct')
				event.amountGive.toString().should.equal(ether(1), 'amountGive is correct')
				event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
			})
		})

		describe('cancelling orders', () => {
			let res
			let invalidId = '9999999'
			before(async () => {
				res = await exchange.cancelOrder('1', {from : depositor}) 
			})

			describe('on success', async () => {
				it('tracks the cancelled order', async () => {
					const cancelled = await exchange.orderCancelled(1)
					cancelled.should.equal(true)	
				})

				it('emits CancelOrder event', async () => {
					const log = res.logs[0]
					const event = log.args
					event.id.toString().should.equal('1', 'id is correct')
					event.user.toString().should.equal(depositor, 'user is correct')
					event.tokenGet.toString().should.equal(token.address, 'tokenGet is correct')
					event.amountGet.toString().should.equal(tokens(1), 'amountGet is correct')
					event.tokenGive.toString().should.equal(ETHER, 'tokenGive is correct')
					event.amountGive.toString().should.equal(ether(1), 'amountGive is correct')
					event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
				})
			})

			describe('on failure', async () => {
				it('rejects invalid orders', async () => {
					await exchange.cancelOrder(invalidId, {from : depositor}).should.be.rejectedWith(EVM_REVERT)
				})

				it('rejects unauthorized cancellations', async () => {
					await exchange.cancelOrder('1', {from : tempUser}).should.be.rejectedWith(EVM_REVERT)
				})
			})

		})


		describe('filling orders', async () => {
			let res
			let balanceUserFill
			let balanceUser
			let balanceFeeAccount

			describe('on success', async () => {
				before(async () => {
					await exchange.makeOrder(token.address, tokens(1), ETHER, ether(1), {from : depositor}) 
					balanceUser = await exchange.tokens(token.address, depositor)
					balanceUserFill = await exchange.tokens(ETHER, otherUser)
					balanceFeeAccount = await exchange.tokens(token.address, feeAccount)
					res = await exchange.fillOrder('2', {from : otherUser})
				})

				it('execute the trade and charge fees', async () => {
					let balance
					balance = await exchange.tokens(token.address, depositor)
					balance.sub(balanceUser).toString().should.equal(tokens(1))

					balance = await exchange.tokens(ETHER, depositor)
					balance.sub(balanceUserFill).toString().should.equal(ether(1))

					balance = await exchange.tokens(token.address, feeAccount)
					balance.sub(balanceFeeAccount).toString().should.equal(tokens(0.1), 'fee is correct')
				})

				it('updates the filled orders', async () => {
					const orderFilled = await exchange.orderFilled('2')
					orderFilled.should.equal(true)
				})

				it('emits Trade event', async () => {
					const log = res.logs[0]
					const event = log.args
					event.id.toString().should.equal('2', 'id is correct')
					event.user.toString().should.equal(depositor, 'user is correct')
					event.tokenGet.toString().should.equal(token.address, 'tokenGet is correct')
					event.amountGet.toString().should.equal(tokens(1), 'amountGet is correct')
					event.tokenGive.toString().should.equal(ETHER, 'tokenGive is correct')
					event.amountGive.toString().should.equal(ether(1), 'amountGive is correct')
					event.userFill.toString().should.equal(otherUser, 'userFill is correct')
					event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
				})
			})

			describe('on failure', async () => {
				it('rejects invalid order id', async () => {
					await exchange.fillOrder('123456', {from : otherUser}).should.be.rejectedWith(EVM_REVERT)
				})
				it('rejects cancelled orders', async () => {
					await exchange.fillOrder('1', {from : otherUser}).should.be.rejectedWith(EVM_REVERT)
				})
				it('rejects previously filled orders', async () => {
					await exchange.fillOrder('2', {from : otherUser}).should.be.rejectedWith(EVM_REVERT)
				})
			})
		})

	})

}) 