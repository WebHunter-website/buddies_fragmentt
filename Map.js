import * as React from 'react';
import MapView, { Marker } from "react-native-maps";
import { StyleSheet, Text, View, Dimensions } from 'react-native';

export default function Map(props) {
  return (
    <View style={styles.container}>
      <MapView 
      style={styles.map} 
      initialRegion={{
        latitude: props.currentLocation.coords.latitude,
        longitude: props.currentLocation.coords.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }}
      onPress={(event) =>{ 
        console.log("cooord:" + props.currentLocation);
        console.log(event.currentLocation);
        props.setvaluesLoc(event.nativeEvent.coordinate)}}
      >
       <Marker 
       coordinate={{ latitude: props.currentLocation.coords.latitude, longitude: props.currentLocation.coords.longitude }}
       />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});
