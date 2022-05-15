import { get } from "lodash";
import moment from "moment";
import { createSelector } from "reselect";
import { ether, ETHER, tokens, RED, GREEN } from "../resources/helper";

const account = state => get(state, 'web3.account')
export const accountSelector = createSelector(account, a => a)

const tokenLoaded = state => get(state, 'token.loaded', false)
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl)

const exchangeLoaded = state => get(state, 'exchange.loaded', false)
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el)

export const contractsLoadedSelector = createSelector(
 tokenLoadedSelector,
 exchangeLoadedSelector,
 (tl, el) => (tl && el)
)

const exchange = state => get(state, 'exchange.contract')
export const exchangeSelector = createSelector(exchange, e => e)

const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false)
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, ol => ol)

const filledOrders = state => get(state, 'exchange.filledOrders.data', [])
export const filledOrdersSelector = createSelector(
    filledOrders, 
    orders => decorateFilledOrders(orders.sort((a, b) => a.timestamp - b.timestamp))
                .sort((a, b) => b.timestamp - a.timestamp)
)

const decorateFilledOrders = (orders) => {
    let previousOrder
    return orders.map(o => {
        o = decorateFilledOrder(o, previousOrder)
        previousOrder = o
        return o
    })
}

const decorateOrder = order => {
    let etherAmount
    let tokenAmount

    if(order.tokenGive == ETHER){
        etherAmount = ether(order.amountGive)
        tokenAmount = tokens(order.amountGet)
    }
    else{
        tokenAmount = ether(order.amountGive)
        etherAmount = tokens(order.amountGet)
    }

    let tokenPrice = etherAmount / tokenAmount
    const precision = 10**5
    tokenPrice = Math.round(tokenPrice * precision) / precision
    
    return {
        ...order,
        etherAmount,
        tokenAmount,
        tokenPrice,
        formattedTime : moment.unix(order.timestamp).format('h:mm:ss a M/D')
    }
}

const decorateFilledOrder = (order, previousOrder) => {
    order = decorateOrder(order) 
    return {
        ...order,
        tokenPriceClass : !previousOrder ? GREEN : (order.tokenPrice >= previousOrder.tokenPrice ? GREEN : RED)
    }
}