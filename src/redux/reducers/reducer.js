import { combineReducers } from 'redux'
import web3 from './web3Reducer'
import token from './tokenReducer'
import exchange from './exchangeReducer'

const rootReducer = combineReducers({
    web3,
    token,
    exchange
})

export default rootReducer