const controlButton = document.getElementById("controlButton");
const input = document.getElementById("input");
const connectionStatus = document.getElementById("connectionStatus");
const bs = document.getElementById('bluetoothState')
const outputText = document.getElementById("output");

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
}, false);

function handleCharacteristicValueChanged(event) {
  const value = event.target.value;
  console.log(String.fromCharCode.apply(null, new Uint8Array(value.buffer)));
  outputText.textContent = String.fromCharCode.apply(null, new Uint8Array(value.buffer));;
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
					let encoder = new TextEncoder('utf-8');
					writeCharacteristic.writeValueWithResponse(encoder.encode(input.value));
				  resolve();
			} else {
				reject("No write characteristic")
			}
		} else {
			reject("No devices paired.")
		}
	}).catch(error => { 
    console.log(error)
	});
	return p;
}


async function BLEManager() {
    connectionStatus.textContent = "SEARCHING";
    connectionStatus.classList.replace("text-muted", "text-secondary") 
    error_code = 0
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] },
        ] 
      });
      pairedDevices = device.name;
      error_code = 1
      const connectedDevice = await device.gatt.connect();
      connectionStatus.textContent = "CONNECTED";
      error_code = 2
      connectionStatus.classList.replace("text-secondary", "text-primary") 
      outputText.innerHTML = "Send 'start' to start measurement"
      const service = await connectedDevice.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
      console.log("Services obtained")
      error_code = 3
      writeCharacteristic = await service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
      console.log("Write Characteristics discovered")
      let textEncoder = new TextEncoder();
      let value = textEncoder.encode(input.value);
      writeCharacteristic.writeValueWithoutResponse(value);
      const readCharacteristic = await service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
      console.log("Read Characteristics discovered")
      error_code = 4
      const output = await readCharacteristic.startNotifications();
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
        connectionStatus.textContent = "CONNECTION FAILED";
      }
      else {
        connectionStatus.textContent = "CANCELLED"
      }
    }
    
  }
  controlButton.addEventListener("click", BLEManager);
  sendButton.addEventListener("click", writeValue)

  // const output = await readCharacteristic.readValue()
  // console.log(output)
  // const t = output.buffer
  // console.log(t)
  // consoutputT text = document.getElementById("output")
  // text.textContent = output.toString()