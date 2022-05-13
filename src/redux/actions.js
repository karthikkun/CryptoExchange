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

