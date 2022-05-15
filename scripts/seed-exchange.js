const Token = artifacts.require("Token")
const Exchange = artifacts.require("Exchange")

const ETHER = '0x0000000000000000000000000000000000000000'
const ether = (val) => {
	return new web3.utils.BN(
		web3.utils.toWei(val.toString(), 'ether')
	)
}
const tokens = (val) => ether(val)
const wait = (seconds) => {
	const millis = seconds*1000
	return new Promise(resolve => setTimeout(resolve, millis))
}

module.exports = async function(callback) {
	try {
		console.log("seed-exchange script running...")

		const accounts = await web3.eth.getAccounts()
		const token = await Token.deployed()
		const exchange = await Exchange.deployed()
		
		const sender = accounts[0]
		const receiver = accounts[1]
		let amount = web3.utils.toWei('10000', 'ether')

		await token.transfer(receiver, amount, {from : sender})
		console.log(`transferred ${amount} from ${sender} to ${receiver}`)

		const user1 = accounts[0]
		const user2 = accounts[1]
		

		//seed an Ether deposit 
		amount = 1
		await exchange.depositEther({from : user1, value : ether(amount)})
		console.log(`deposited ${amount} Ether from  ${user1}`)

		//seed a Token deposit
		amount = 10000
		await token.approve(exchange.address, tokens(amount), {from : user2})
		await exchange.depositToken(token.address, tokens(amount), {from : user2})
		console.log(`deposited ${amount} tokens from ${user2}`)
	
		//seed a cancelled order
		let res
		let orderId
		res = await exchange.makeOrder(token.address, tokens(100), ETHER, ether(0.1), {from : user1})
		console.log(`made an order from ${user1}`)
		orderId = res.logs[0].args.id
		await exchange.cancelOrder(orderId, {from : user1})
		console.log(`order cancelled from ${user1}`)
	
		/**seed filled orders**/
		result = await exchange.makeOrder(token.address, tokens(100), ETHER, ether(0.1), { from: user1 })
    	console.log(`made order from ${user1}`)

	    orderId = result.logs[0].args.id
	    await exchange.fillOrder(orderId, { from: user2 })
	    console.log(`filled order from ${user1}`)

	    await wait(1)

	    result = await exchange.makeOrder(token.address, tokens(50), ETHER, ether(0.01), { from: user1 })
	    console.log(`made order from ${user1}`)

	    orderId = result.logs[0].args.id
	    await exchange.fillOrder(orderId, { from: user2 })
	    console.log(`filled order from ${user1}`)

	    await wait(1)

	    result = await exchange.makeOrder(token.address, tokens(200), ETHER, ether(0.15), { from: user1 })
	    console.log(`made order from ${user1}`)

	    orderId = result.logs[0].args.id
	    await exchange.fillOrder(orderId, { from: user2 })
	    console.log(`filled order from ${user1}`)

	    await wait(1)

		/**seed open orders**/
	    for (let i = 0; i < 10; i++) {
	      result = await exchange.makeOrder(token.address, tokens(10 * i), ETHER, ether(0.01), { from: user1 })
	      console.log(`made order from ${user1}`)
	      // Wait 1 second
	      await wait(1)
	    }

	    for (let i = 0; i < 10; i++) {
	      result = await exchange.makeOrder(ETHER, ether(0.01), token.address, tokens(10 * i), { from: user2 })
	      console.log(`made order from ${user2}`)
	      // Wait 1 second
	      await wait(1)
	    }
	}
	catch(err) {
		console.log(err)
	}
	callback()
}