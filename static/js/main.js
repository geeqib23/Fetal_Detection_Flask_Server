const controlButton = document.getElementById("controlButton");
const deviceNameInput = document.getElementById("deviceNameInput");
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
var error_code
async function BLEManager() {
    connectionStatus.textContent = "SEARCHING";
    connectionStatus.classList.replace("text-muted", "text-secondary") 
    error_code = 0
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices:true,
        optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e']
      });
      error_code = 1
      const connectedDevice = await device.gatt.connect();
      connectionStatus.textContent = "CONNECTED";
      connectionStatus.classList.replace("text-secondary", "text-primary") 
      outputText.innerHTML = "Predicting..."
      outputText.classList.replace("text-muted","text-success")
      error_code = 2
      const service = await connectedDevice.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
      console.log("Services obtained")
      error_code = 3
      const characteristic = await service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
      console.log("Characteristics discovered")
      error_code = 4
      // const output = await characteristic.readValue()
      // console.log(output)
      // const t = output.buffer
      // console.log(t)
      // consoutputT text = document.getElementById("output")
      // text.textContent = output.toString()
      const output = await characteristic.startNotifications();
      error_code = 5
      characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged)
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