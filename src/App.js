import React, { Component } from 'react';
import { connect } from 'react-redux';
import './App.css';
import Navbar from './components/Navbar';
import Content from './components/Content';

import { loadWeb3, loadAccount, loadNetworkId } from './redux/interactions';
import { contractsLoadedSelector } from './redux/selectors';


class App extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {

    const web3 = loadWeb3(dispatch)
    await web3.eth.net.getNetworkType()
    const networkId = await loadNetworkId(web3, dispatch)
    await loadAccount(web3, dispatch)
    
  }

  render() {
    return (
      <div>
        <Navbar />
        {this.props.contracsLoaded ? <Content /> : <div className="content"></div>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    contracsLoaded: contractsLoadedSelector(state)
  }
}
export default connect(mapStateToProps)(App);