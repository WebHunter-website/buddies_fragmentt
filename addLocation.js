import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, TextInput} from 'react-native';
import styles from '../../styles/globalStyle';
import * as Location from 'expo-location';
import Map from '../../components/Map';
import registration from '../../components/register/regitracion';
import CheckBoxComponent from '../../components/register/checkbox';
import setSettingsFetch from '../../components/register/setSettingsFetch';
import {Promisify} from '../../src/helpers';

export default function AddLocation(props) {
  const [currentLocation, setCurrentLocation] = useState(undefined);
  const [values, setvalues] = useState(props.route.params.values);
  const [pin, setPin] = useState('');
  const [_, requestPermission] = Location.useForegroundPermissions();
  const [isChecked, setChecked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleGenerateVerification = () => {
    if (!isChecked) {
      alert('Brak wymaganych zgód');
      return;
    }
    setModalOpen(true);
    console.log(values.email);
    props.socket.emit('send verification pin', values.email);
  };

  const checkPinIsOk = () => {
    console.log(`Sending pin ${pin} for user ${values.email} to verification`);
    return new Promise((resolve, _) =>
      props.socket.emit(
        'Verify pin to register',
        values.email,
        pin,
        isPinOk => {
          console.log(
            `Pin ${pin} for user ${values.email}: ` + isPinOk
              ? '[OK]'
              : '[NOK]',
          );
          resolve(isPinOk);
        },
      ),
    );
  };

  useEffect(() => {
    alert(". Twoja przybliżona lokalizacja jest udostępniana innym użytkownikom w postaci przybliżonej odległości. Dokładne dane geolokalizacyjne nie są usdostępniane.")
    console.log(values);
    requestPermission().then(permission => {
      getCurrentLocation(permission);
    });
  }, []);

  const handleSubmit = () => {
    console.log(values.email);
    checkPinIsOk()
      .then(isPinOk => {
        if (!isPinOk) {
          return Promise.resolve({
            wrongPin: true,
          });
        } else {
          return registration({
            ...values,
            location: {
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            },
          });
        }
      })
      .then(registrationResponse => {
        console.log('userRegisterred');
        console.log(registrationResponse.userRegistered);
        if (registrationResponse.wrongPin) {
          alert('niepoprawny pin');
          return;
        } else if (!registrationResponse.userRegistered) {
          alert('użytkownik o takim adresie e-mail już istnieje');
          return;
        } else {
          setSettingsFetch(values.email, isChecked);
          props.navigation.navigate('Login');
        }
      });
  };

  const getCurrentLocation = permission => {
    console.log(
      `Location permission is ${permission.status} (expecting "${Location.PermissionStatus.GRANTED}")`,
    );
    if (permission.status == Location.PermissionStatus.GRANTED) {
      Location.getCurrentPositionAsync({}).then(location => {
        setCurrentLocation(location);
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.secondaryText, {marginTop: 30}]}>
        Dodaj lokalizacje
      </Text>
      <Text style={[styles.thirdText, {marginVertical: 10, fontSize: 20}]}>
        {' '}
        To już ostatni krok!
      </Text>
      <Text style={[styles.thirdText, {marginVertical: 10, fontSize: 20}]}>
        zaraz otworzy się mapka z Twoją lokalizacją, po jej wyświetleniu kliknij
        przycisk- zarejestruj się. 
      </Text>
      {currentLocation != undefined && (
        <Map
          currentLocation={currentLocation}
          // onPress={(event) =>{
          //   console.log(event.nativeEvent.coordinate);
          //   setCurrentLocation(event.nativeEvent.coordinate)}}
          // setvaluesLoc={setCurrentLocation}
        />
      )}
      {currentLocation != undefined && (
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <CheckBoxComponent isChecked={isChecked} setChecked={setChecked} />
          <TouchableOpacity
            style={[styles.secondaryButton, {width: 180}]}
            onPress={handleGenerateVerification}>
            <Text style={{textAlign: 'center'}}>Zarejestruj</Text>
          </TouchableOpacity>
        </View>
      )}
      {modalOpen && (
        <View
          style={{
            position: 'absolute',
            backgroundColor: 'white',
            borderColor: 'black',
            borderWidth: 1,
            paddingVertical: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{fontSize: 18, width: 250, textAlign: 'center'}}>
            Na Twojego maila wysłaliśmy kod weryfikacyjny sprawdź pocztę i wpisz
            poniżej podany kod
          </Text>
          <Text>Jeśli kod nie dotarł sprawdź spam</Text>
          <TextInput
            placeholder="tutaj wpisz kod"
            style={[styles.register_input, {width: 250}]}
            onChangeText={setPin}
            value={pin}
          />
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.secondaryButton, {width: 120, marginBottom: 10}]}>
            <Text>Potwierdź</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
