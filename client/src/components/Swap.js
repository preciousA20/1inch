import {useState, useEffect} from 'react'
import {Input, Popover, Radio, Modal, message} from 'antd'
import {ArrowDownOutlined, DownOutlined, SettingOutlined} from '@ant-design/icons'
import tokenList from '../tokenList.json'
import axios from "axios"
import {useSendTransaction, useWaitForTransaction} from 'wagmi'

function Swap({address, isConnected}) {
  const [slippage, setSlippage] = useState(2.5)
  const [tokenOneAmount, setTokenOneAmount] = useState(null)
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null)
  const [tokenOne, setTokenOne] = useState(tokenList[0])
  const [tokenTwo, setTokenTwo] = useState(tokenList[1])
  const [isOpen, setIsOpen] = useState(false)
  const [changeToken, setChangeToken] = useState(1)
  const [prices, setPrices] = useState(null)
  const [txDetails, setTxDetails] = useState({
    to: null,
    data: null,
    value: null
  })

  const {data, sendtransaction} = useSendTransaction({
    request: {
      from: address,
      to: String(txDetails.to),
      data: String(txDetails.data),
      value: String(txDetails.value)
    }
  })

  const openModal = (asset)=>{
    setChangeToken(asset)
    setIsOpen(true)
  }

  const changeAmount = (e)=>{
    setTokenOneAmount(e.target.value)
    if(e.target.value && prices){
      setTokenTwoAmount(e.target.value * prices.ratio)
    }else{
      setTokenTwoAmount(null)
    }
  }

  const handleSlippageChange = (e)=>{
    setSlippage(e.target.value)
  }

  const switchToken = () =>{
    setPrices(null)
    setTokenOneAmount(null)
    setTokenTwoAmount(null)
    const one = tokenOne
    const two = tokenTwo 
    setTokenOne(two)
    setTokenTwo(one)
    fetchPrices(two.address, one.address)
  }

  const modifyToken=(item)=>{
    setPrices(null)
    setTokenOneAmount(null)
    setTokenTwoAmount(null)
    if(changeToken === 1){
      setTokenOne(tokenList[item])
      fetchPrices(tokenList[item].address, tokenTwo.address)
    }else{
      setTokenTwo(tokenList[item])
      fetchPrices(tokenOne.address, tokenList[item].address)
    }
    setIsOpen(false)
  }

  const fetchPrices = async(one, two)=>{
    try {
      const response = await axios.get("http://localhost:3001/tokenPrice",{
        params: {
          addressOne: one,
          addressTwo: two
        }
      })

      setPrices(response.data)
      //console.log(response.data)
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(()=>{
    fetchPrices(tokenList[0].address, tokenList[1].address)
  },[])

  async function fetchdexSwap() {
    const proxyUrl = 'https://thingproxy.freeboard.io/fetch/'

    const allowance = await axios.get(`${proxyUrl}https://api.1inch.io/v5.0/1/approve/allowance?tokenAddress=${tokenOne.address}&walletAddress=${address}`)
    console.log(allowance.data.allowance)
    // const url = `${proxyUrl}https://api.1inch.io/v5.0/1/approve/allowance?tokenAddress=${tokenOne.address}&walletAddress=${address}`

    // const allowance = await fetch(url, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // })

    // const responseJson = await allowance.json()
    // console.log(responseJson)
    if(allowance.data.allowance === "0"){
     // const url = `${proxyUrl}https://api.1inch.io/v5.0/1/approve/transaction?tokenAddress=${tokenOne.address}`
      const approve = await axios.get(`${proxyUrl}https://api.1inch.io/v5.0/1/approve/transaction?tokenAddress=${tokenOne.address}`)

      setTxDetails(approve.data);
      console.log(approve.data)
      return

    }
    


    // const tx = await axios.get(
    //   `${proxyUrl}https://api.1inch.io/v5.0/1/swap?fromTokenAddress=${tokenOne.address}&toTokenAddress=${tokenTwo.address}&amount=${tokenOneAmount.padEnd(tokenOne.decimals+tokenOneAmount.length, '0')}&fromAddress=${address}&slippage=${slippage}`
    // )

    // let decimals = Number(`1E${tokenTwo.decimals}`)
    // setTokenTwoAmount((Number(tx.data.toTokenAmount)/decimals).toFixed(2));

    // setTxDetails(tx.data.tx);
  }

  useEffect(()=>{

    if(txDetails.to && isConnected){
      sendtransaction()
    }
  },[txDetails])

  const setting = (
   <>
    <div>Slippage Tolerance</div>

    <div>
    <Radio.Group value={slippage} onChange={handleSlippageChange}>
      <Radio.Button value={0.5}>0.5%</Radio.Button>
      <Radio.Button value={2.5}>2.5%</Radio.Button>
      <Radio.Button value={5}>5.0%</Radio.Button>

    </Radio.Group>
    </div>
   </>
  )


  return (
    <>
    <Modal open={isOpen} footer={null} onCancel={()=>setIsOpen(false)} title='Select a token'>
      <div className='modalContent'>
        {tokenList?.map((e, index)=>{
          return (
            <div className='tokenChoice' key={index} onClick={()=>modifyToken(index)}>
              <img src={e.img} alt={e.ticker} className='tokenLogo'/>

              <div className='tokenChoiceNames'>
                  <div className='tokenName'>{e.name}</div>
                  <div className='tokenTicker'>{e.ticker}</div>
              </div>
            </div>
          )
        })}
      </div>
    </Modal>
    <div
    className='tradeBox'>

      <div className='tradeBoxHeader'>
        <h4>Swap</h4>
        <Popover
        content={setting}
          title='Setting'
          trigger='click'
          placement='bottomRight'
        >
          <SettingOutlined className='cog'/>
        </Popover>
        
      </div>

      <div className='inputs'>
        <Input placeholder='0' value={tokenOneAmount} onChange={changeAmount} disabled={!prices}/>
        <Input placeholder='0' value={tokenTwoAmount} disabled={true}/>
        <div className='switchButton' onClick={switchToken}>
          <ArrowDownOutlined classID='switchArrow'/>
        </div>
        <div className='assetOne' onClick={()=>openModal(1)}>
          <img src={tokenOne.img} alt='assetOneLogo' className='assetLogo'/>
          {tokenOne.ticker}
          <DownOutlined />
        </div>
        <div className='assetTwo' onClick={()=>openModal(2)}>
          <img src={tokenTwo.img} alt='assetLogo' className='assetLogo'/>
          {tokenTwo.ticker}
          <DownOutlined />
        </div>
      </div>

        <div className='swapButton' disabled={!tokenOne || !isConnected} onClick={()=>fetchdexSwap()}>Swap</div>

    </div>
    </>
  )
}

export default Swap