// WEB3
export function web3Loaded(connection) {
    return { 
        type: 'WEB3_LOADED',
        connection
    }
}

export function web3AccountLoaded(account) {
    return { 
        type: 'WEB3_ACCOUNT_LOADED',
        account
    }
}

export function networkIdLoaded(networkId) {
    return { 
        type: 'NETWORK_ID_LOADED',
        networkId
    }
}

//TOKEN
export function tokenLoaded(contract) {
    return {
        type: 'TOKEN_LOADED',
        contract
    }
}

//EXCHANGE

export function exchangeLoaded(contract) {
    return { 
        type: 'EXCHANGE_LOADED',
        contract
    }
}

export function cancelledOrdersLoaded(cancelledOrders) {
    return { 
        type: 'CANCELLED_ORDERS_LOADED',
        cancelledOrders
    }
}

export function filledOrdersLoaded(filledOrders) {
    return { 
        type: 'FILLED_ORDERS_LOADED',
        filledOrders
    }
}

export function ordersLoaded(orders) {
    return { 
        type: 'ORDERS_LOADED',
        orders
    }
}
