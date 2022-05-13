import React from 'react'
import ReactDOM from 'react-dom'
import 'bootstrap/dist/css/bootstrap.css'
import { Provider } from 'react-redux'
import App from './App'
import configureAppStore from './redux/configureAppStore'


ReactDOM.render(
  <Provider store={configureAppStore()}>
    <App />
  </Provider>,
  document.getElementById('root')
)

/// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
// import * as serviceWorker from './serviceWorker'
