import React from 'react'
import Logo from '../moralis-logo.svg'
import ETH from '../eth.svg'
import { Link } from 'react-router-dom'

function Header({address, isConnected, connect}) {
  return (
    <header>
      <div className='leftH'>
        <img src={Logo} alt='logo' className='logo'/>
        <Link to='/' className='link'>
          <div className='headerItem'>Swap</div>
        </Link>
        <Link to='/tokens' className='link'>
          <div className='headerItem'>Token</div>
        </Link>
      </div>

      <div className='rightH'>
        <div>
          <img src={ETH} alt='ethereum' className='eth'/>
          Ethereum
        </div>

        <div className='connectButton' onClick={connect}>
          {
            isConnected ? (address.slice(0, 4) + "..." + address.slice(-4)) : "Connect"
          }
        </div>
      </div>
    </header>
  )
}

export default Header