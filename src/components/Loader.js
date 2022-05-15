import React from 'react'

function Loader({ type }) {
  switch (type) {
      case 'table':
        return (<tbody className='spinner-border text-light text-center'/>)
      default:
        return (
            <div className='spinner-border text-light text-center'/>
        )
  }
}

export default Loader