const controlButton = document.getElementById("controlButton")
const input = document.getElementById("input")
const connectionStatus = document.getElementById("connectionStatus")
const bs = document.getElementById('bluetoothState')
const outputText = document.getElementById("output")


// const dataPoints1 = [{x:0,y:1233},{x:1,y:1263},{x:3,y:1933},{x:4,y:2233}]
// const dataPoints2 = [{x:0,y:123},{x:1,y:263},{x:3,y:933},{x:4,y:223}]
// const dataPoints3 = [{x:0,y:1243},{x:1,y:2463},{x:3,y:9233},{x:4,y:2523}]
// const dataPoints4 = [{x:0,y:1213},{x:1,y:2663},{x:3,y:9733},{x:4,y:2263}]

const dataPoints1 = []
const dataPoints2 = []
const dataPoints3 = []
const dataPoints4 = []

const chart = new CanvasJS.Chart("chartContainer", {
  zoomEnabled: true,
  // title: {
  //   text: "Accelerometer data",
  //   fontFamily: "Helvetica"
  // },
  axisX: {
    title: "Time"
  },
  axisY:{
    title: "Acceleration",
    prefix: ""
  }, 
  toolTip: {
    shared: true
  },
  legend: {
    cursor:"pointer",
    verticalAlign: "top",
    fontSize: 22,
    fontColor: "dimGrey",
  },
  data: [{ 
    type: "line",
    name: "Acc1",
    dataPoints: dataPoints1
    },
    {				
      type: "line",
      name: "Acc2" ,
      dataPoints: dataPoints2
    },
    {				
      type: "line",
      name: "Acc3" ,
      dataPoints: dataPoints3
    },
    {				
      type: "line",
      name: "Acc4" ,
      dataPoints: dataPoints4
    }]
})
chart.render()
var xVal = dataPoints1.length + 1;
const updateChart = function (a1,a2,a3,a4) {
  dataPoints1.push({x: xVal,y: a1});
  dataPoints2.push({x: xVal,y: a2});
  dataPoints3.push({x: xVal,y: a3});
  dataPoints4.push({x: xVal,y: a4});
  xVal++;
  if (dataPoints1.length >  40 )
  {
    dataPoints1.shift();				
    dataPoints2.shift();				
    dataPoints3.shift();				
    dataPoints4.shift();				
  }
  chart.render();		
// update chart after specified time. 
}


function isWebBluetoothEnabled() {
  if (!navigator.bluetooth) {
    console.log('Web Bluetooth API is not available in this browser!')
    bs.classList.replace("text-muted", "text-danger")
    bs.innerText = 'Not available'
    return false
  }
  bs.classList.replace("text-muted", "text-success")
  bs.innerText = 'Available'
  return true
}
document.addEventListener('DOMContentLoaded', function() {
  isWebBluetoothEnabled()
}, false)

function handleCharacteristicValueChanged(event) {
  const value = event.target.value
  const rx_data = String.fromCharCode.apply(null, new Uint8Array(value.buffer))
  console.log(rx_data)
  if(rx_data[0] != 'd'){
    outputText.textContent = rx_data
  }
  else{
    str = rx_data.substring(1); // Remove the first character ('d')
    let values = str.split(',').map(val => parseInt(val));
    console.log(values);
    [a1,a2,a3,a4] = values
    updateChart(a1,a2,a3,a4)
  }
}

var error_code = -1
var pairedDevices = ""
var writeCharacteristic = null

var writeValue = function () {
	p = new Promise(function (resolve, reject) {
		// See if the device is paired.
		if (pairedDevices) {
			// Has a write reference been discovered.
			if (writeCharacteristic != null) {
					let encoder = new TextEncoder('utf-8')
					writeCharacteristic.writeValueWithoutResponse(encoder.encode(input.value))
				  resolve()
			} else {
				reject("No write characteristic")
			}
		} else {
			reject("No devices paired.")
		}
	}).catch(error => { 
    console.log(error)
	})
	return p
}


async function BLEManager() {
    connectionStatus.textContent = "SEARCHING"
    connectionStatus.classList.replace("text-muted", "text-secondary") 
    error_code = 0
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] },
        ] 
      })
      pairedDevices = device.name
      error_code = 1
      const connectedDevice = await device.gatt.connect()
      connectionStatus.textContent = "CONNECTED"
      error_code = 2
      connectionStatus.classList.replace("text-secondary", "text-primary") 
      outputText.innerHTML = "Send 'start' to start measurement"
      const service = await connectedDevice.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e")
      console.log("Services obtained")
      error_code = 3
      writeCharacteristic = await service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e")
      console.log("Write Characteristics discovered")
      let textEncoder = new TextEncoder()
      let value = textEncoder.encode(input.value)
      writeCharacteristic.writeValueWithoutResponse(value)
      const readCharacteristic = await service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e")
      console.log("Read Characteristics discovered")
      error_code = 4
      const output = await readCharacteristic.startNotifications()
      outputText.classList.replace("text-muted","text-success")
      error_code = 5
      readCharacteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged)
      error_code = 6
      console.log("notification started successfully")
    }
    catch(e) {
      console.log("err_code",error_code)
      console.log(e)
      if (typeof device !== 'undefined') {
        connectionStatus.textContent = "CONNECTION FAILED"
      }
      else {
        connectionStatus.textContent = "CANCELLED"
      }
    }
    
  }
  controlButton.addEventListener("click", BLEManager)
  sendButton.addEventListener("click", writeValue)

  // const output = await readCharacteristic.readValue()
  // console.log(output)
  // const t = output.buffer
  // console.log(t)
  // consoutputT text = document.getElementById("output")
  // text.textContent = output.toString()