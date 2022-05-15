import { fill } from 'lodash'
import React from 'react'
import { useSelector } from 'react-redux'
import { filledOrdersLoadedSelector, filledOrdersSelector } from '../redux/selectors'
import Loader from './Loader'

function Trades() {
    const filledOrdersLoaded = useSelector(filledOrdersLoadedSelector)
    const filledOrders = useSelector(filledOrdersSelector)

    return (
        <div className="card bg-dark text-white">
            <div className="card-header">
                Trades
            </div>
            <div className="card-body">
                <table className='table table-dark table-sm small'>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>WCOIN</th>
                            <th>ETH/WCOIN</th>
                        </tr>
                    </thead>
                    {filledOrdersLoaded ? (
                        <tbody>
                            {filledOrders.map(order => {
                                return (
                                    <tr className={`order-${order.id}`} key={order.id}>
                                        <td className='text-muted'>{order.formattedTime}</td>
                                        <td>{order.tokenAmount}</td>
                                        <td className={`text-${order.tokenPriceClass}`}>{order.tokenPrice}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    ) : <Loader type='table' />}



                </table>
            </div>
        </div>
    )
}

export default Trades