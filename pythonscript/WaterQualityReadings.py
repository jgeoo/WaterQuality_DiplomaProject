import spidev
import time
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from datetime import datetime
import requests
 
cred = credentials.Certificate('/home/jgeoo/Desktop/waterquality-d8c51-firebase-adminsdk-fbsvc-49f4519525.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': "https://waterquality-d8c51-default-rtdb.europe-west1.firebasedatabase.app/" 
})
 
temperature = 25.0
 
 
 
def get_location_from_ip():
    try:
        response = requests.get('https://ipinfo.io/json')  
        data = response.json()
        loc = data.get('loc')  
        city = data.get('city')
        region = data.get('region')
        country = data.get('country')
        if loc:
            lat, lon = map(float, loc.split(','))
            return {
                "latitude": lat,
                "longitude": lon,
                "locationName": f"{city}, {region}, {country}"
            }
    except Exception as e:
        print(f"IP-based location error: {e}")
    return None
 
 
 
 
spi = spidev.SpiDev()
spi.open(0, 0)  
spi.max_speed_hz = 50000  
 
 
 
def sendData(sensor_time, location_name, data):
    try:
        ref = db.reference(location_name)
        ref.child(sensor_time).set(data)
        print('Data sent successfully!')
    except Exception as e:
        print(f'Error sending data: {e}')
 
 
def read_adc(channel):
    if channel < 0 or channel > 7:
        return -1 
    adc_response = spi.xfer2([1, (8 + channel) << 4, 0])  
    adc_value = ((adc_response[1] & 3) << 8) + adc_response[2]  
    return adc_value
 
 
def calculate_pH_value(raw_value):
    ph_value = raw_value * (-0.0189) + 16.16
    return ph_value
 
def calculate_tds_value(raw_value):
    voltage = (raw_value/1023) * 3.3
    compensation_coefficient = 1.0 + 0.02 * ( temperature - 25.0 )
    compensated_voltage = voltage / compensation_coefficient
 
    tds_value = ( 133.42 * compensated_voltage**3 -
                  255.86 * compensated_voltage**2 +
                  857.39 * compensated_voltage) + 0.5
 
    return tds_value
 
def calculate_turbidity_value(raw_value):
 
    percentage = (raw_value  / 1023) * 100
 
    return percentage
 
 
 
try:
    while True:
 
        adc_value_pH = read_adc(0)
        adc_value_turbidity = read_adc(1)
        adc_value_tds  = read_adc(2)
 
 
        if adc_value_pH == -1 or adc_value_turbidity == -1 or adc_value_tds == -1:
            print("Invalid ADC channel.")
            break
 
 
        pH_value = calculate_pH_value(adc_value_pH)
        turbidity_value = calculate_turbidity_value(adc_value_turbidity)
        tds_value = calculate_tds_value(adc_value_tds) 
 
        print("ADC Value (pH): {}, pH: {:.2f}, ADC Value (Turbidity): {}, Turbidity: {:.2f}%, ADC Value(TDS): {:.2f} TDS:{:.2f}".format(
            adc_value_pH, pH_value, adc_value_turbidity, turbidity_value, tds_value,tds_value ))
 
 
 
        location = get_location_from_ip()
        if location:
            locationLatitude = location["latitude"]
            locationLongitude = location["longitude"]
            locationName = location["locationName"]
            sensor_data = {
                "pH": pH_value,
                "turbidity": turbidity_value,
                "tds":tds_value,
                "latitude":locationLatitude,
                "longitude":locationLongitude,
 
            }
 
            data_read_at_time = datetime.now().strftime("%H:%M:%S")
            sendData(data_read_at_time, locationName, sensor_data)
        else:
            print("Could not determine location, data not sent.")
 
        time.sleep(10)
 
 
except KeyboardInterrupt:
    print("Exiting...")
 
 
finally:
    spi.close()
 