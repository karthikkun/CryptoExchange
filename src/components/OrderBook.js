import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    orderBookSelector,
    orderBookLoadedSelector
} from '../redux/selectors'
import Loader from './Loader'

const showOrderBook = (props) => {
    const { orderBook } = props

    return (
        <tbody>
            {orderBook.sellOrders.map(order => renderOrder(order))}
            <tr>
                <th>WCOIN</th>
                <th>ETH/WCOIN</th>
                <th>ETH</th>
            </tr>
            {orderBook.buyOrders.map(order => renderOrder(order))}
        </tbody>
    )
}

const renderOrder = order => {
    return (
        <tr className={`order-${order.id}`} key={order.id}>
            <td >{order.tokenAmount}</td>
            <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
            <td >{order.etherAmount}</td>
        </tr>
    )
}

export class OrderBook extends Component {
    render() {
        console.log(this.props.showOrderBook, "showorderbook")
        console.log(this.props.orderBook, "orderbook")
        return (
            <div className="vertical">
                <div className="card bg-dark text-white">
                    <div className="card-header">
                        Order Book
                    </div>
                    <div className="card-body">
                        <table className='table table-dark table-sm small'>
                            <thead>
                                <tr>
                                    <th>WCOIN</th>
                                    <th>ETH/WCOIN</th>
                                    <th>ETH</th>
                                </tr>
                            </thead>
                            {this.props.showOrderBook ? showOrderBook(this.props) : <Loader type='table' />}
                        </table>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    orderBook: orderBookSelector(state),
    showOrderBook: orderBookLoadedSelector(state)
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(OrderBook)