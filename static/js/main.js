const controlButton = document.getElementById("controlButton");
const deviceNameInput = document.getElementById("deviceNameInput");
const connectionStatus = document.getElementById("connectionStatus");

function isWebBluetoothEnabled() {
  if (!navigator.bluetooth) {
      console.log('Web Bluetooth API is not available in this browser!')
      document.getElementById('bluetoothState').innerText = 'Not available'
      return false
  }
  document.getElementById('bluetoothState').innerText = 'Available'
  return true
}
document.addEventListener('DOMContentLoaded', function() {
  isWebBluetoothEnabled()
}, false);
var error_code
async function BLEManager() {
    connectionStatus.textContent = "SEARCHING"; 
    error_code = 0
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{
          name: deviceNameInput.value,
          services: ['6E400003-B5A3-F393-E0A9-E50E24DCCA9E']
        }]
      });
      error_code = 1
      const connectedDevice = await device.gatt.connect();
      connectionStatus.textContent = "CONNECTED";
      error_code = 2
      const outputService = await connectedDevice.getPrimaryService("6E400003-B5A3-F393-E0A9-E50E24DCCA9E");
      console.log("Services obtained")
      error_code = 3
      const outputCharacteristic = await outputService.getCharacteristic("6E400003-B5A3-F393-E0A9-E50E24DCCA9E");
      console.log("Characteristics discovered")
      error_code = 4
      const output = await outputCharacteristic.readValue();
      console.log(output)
      const outputConv = output.getUint8(0);
      console.log(outputConv)
      const outputCharge = document.getElementById("output");
      outputCharge.textContent = outputConv.toString();
    }
    catch {
      console.log("err_code",error_code)
      if (typeof device !== 'undefined') {
        connectionStatus.textContent = "CONNECTION FAILED";
      }
      else {
        connectionStatus.textContent = "CANCELLED"
      }
    }
   
  }
controlButton.addEventListener("click", BLEManager);