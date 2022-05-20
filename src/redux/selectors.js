import { get, reject, groupBy } from "lodash";
import moment from "moment";
import { createSelector } from "reselect";
import { ether, ETHER, tokens, RED, GREEN, BUY, SELL } from "../resources/helper";

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

const cancelledOrdersLoaded = state => get(state, 'exchange.cancelledOrders.loaded', false)
export const cancelledOrdersLoadedSelector = createSelector(cancelledOrdersLoaded, ol => ol)

const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
export const cancelledOrdersSelector = createSelector(cancelledOrders, o => o)

const allOrdersLoaded = state => get(state, 'exchange.orders.loaded', false)
export const allOrdersLoadedSelector = createSelector(allOrdersLoaded, ol => ol)

const allOrders = state => get(state, 'exchange.orders.data', [])
export const allOrdersSelector = createSelector(allOrders, o => o)

const openOrders = state => {
    const all = allOrders(state)
    const cancelled = cancelledOrders(state)
    const filled = filledOrders(state)

    const openOrders = reject(all, (order) => {
        const orderFilled = filled.some((o) => o.id == order.id)
        const orderCancelled = cancelled.some((o) => o.id == order.id)
        return(orderFilled || orderCancelled)
    })
    return openOrders
}

const orderBookLoaded = state => cancelledOrdersLoaded(state) && filledOrdersLoaded(state) && allOrdersLoaded(state)
export const orderBookLoadedSelector = createSelector(orderBookLoaded, ol => ol)

export const orderBookSelector = createSelector(
    openOrders,
    (orders) => {
        orders = decorateOrderBookOrders(orders)
        orders = groupBy(orders, 'orderType')
        const buyOrders = get(orders, BUY, [])
        const sellOrders = get(orders, SELL, [])
        orders = {
            ...orders,
            buyOrders : buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
            sellOrders : sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
        }
        return orders
    }
)

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

const decorateFilledOrders = (orders) => {
    let previousOrder
    return orders.map(o => {
        o = decorateFilledOrder(o, previousOrder)
        previousOrder = o
        return o
    })
}

const decorateFilledOrder = (order, previousOrder) => {
    order = decorateOrder(order) 
    return {
        ...order,
        tokenPriceClass : !previousOrder ? GREEN : (order.tokenPrice >= previousOrder.tokenPrice ? GREEN : RED)
    }
}

const decorateOrderBookOrders = (orders) => {
    return(
        orders.map(order => {
            order = decorateOrder(order)
            order = decorateOrderBookOrder(order)
            return order
        })
    )
}

const decorateOrderBookOrder = order => {
    const orderType = order.tokenGive == ETHER ? BUY : SELL
    return ({
        ...order,
        orderType,
        orderTypeClass : orderType == BUY ? GREEN : RED,
        orderFillClass : orderType == BUY ? SELL : BUY
    })
}