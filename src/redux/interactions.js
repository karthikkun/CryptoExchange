import Web3 from "web3"
import { web3Loaded, web3AccountLoaded, networkIdLoaded, tokenLoaded, exchangeLoaded, cancelledOrdersLoaded, filledOrdersLoaded, ordersLoaded} from "./actions"
import Token from '../abis/Token.json';
import Exchange from '../abis/Exchange.json'

export const loadWeb3 = (dispatch) => {
    const web3 = new Web3(Web3.givenProvider || 'http://172.27.208.1:7545')
    dispatch(web3Loaded(web3))
    return web3
}

export const loadAccount = async (web3, dispatch) => {
    const accounts = await web3.eth.getAccounts()
    const account = accounts[0]
    dispatch(web3AccountLoaded(account))
    return account
}

export const loadToken = async (web3, networkId, dispatch) => {
    try {
        const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address)
        dispatch(tokenLoaded(token))
        return token
    } catch (error) {
        console.log('Contract not deployed to the current network. Please select another network with Metamask.')
        return null
    }
}

export const loadExchange = async (web3, networkId, dispatch) => {
    try {
        const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address)
        dispatch(exchangeLoaded(exchange))
        return exchange
    } catch (error) {
        console.log('Contract not deployed to the current network. Please select another network with Metamask.')
        return null
    }
}

export const loadNetworkId = async (web3, dispatch) => {
    const networkId = await web3.eth.net.getId()
    dispatch(networkIdLoaded(networkId))
    return networkId
}

export const loadAllOrders = async(exchange, dispatch) => {
    const cancelEvents = await exchange.getPastEvents('CancelOrder', {fromBlock : 0, toBlock : 'latest'})
    const cancelledOrders = cancelEvents.map((event) => event.returnValues)
    dispatch(cancelledOrdersLoaded(cancelledOrders))
    const tradeEvents = await exchange.getPastEvents('Trade', {fromBlock : 0, toBlock : 'latest'})
    const filledOrders = tradeEvents.map((event) => event.returnValues)
    dispatch(filledOrdersLoaded(filledOrders))
    const orderEvents = await exchange.getPastEvents('Order', {fromBlock : 0, toBlock : 'latest'})
    const orders = orderEvents.map((event) => event.returnValues)
    dispatch(ordersLoaded(orders))
}