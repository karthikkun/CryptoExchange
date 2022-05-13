import Web3 from "web3"
import { web3Loaded, web3AccountLoaded, networkIdLoaded, tokenLoaded, exchangeLoaded } from "./actions"


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

export const loadNetworkId = async (web3, dispatch) => {
    const networkId = await web3.eth.net.getId()
    dispatch(networkIdLoaded(networkId))
    return networkId
}

