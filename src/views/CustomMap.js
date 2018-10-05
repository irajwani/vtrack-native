import React, { Component } from 'react'
import { Text, Image, TouchableOpacity, StyleSheet, View, Dimensions, Platform } from 'react-native'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Marker, AnimatedRegion, Polyline, Circle } from "react-native-maps";
import haversine from "haversine";
import MapViewDirections from 'react-native-maps-directions';
import firebase from '../cloud/firebase.js';

const APIKey = "AIzaSyD2zYVyRTyNemGQtnrjsZnGGrR7R0knzMg";
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 29.95539;
const LONGITUDE = 78.07513;
const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
//Icons made by SimpleIcon from wwww.flaticon.com is licensed by Creative Commons BY 3.0

const priceZones = [ {latlng: {latitude: 24.773303 , longitude: 67.080164}, intensity: 'high', radius: 1000}, {latlng: { latitude: 24.798792, longitude: 67.048586}, intensity: 'low', radius: 1000} ]

export default class CustomMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      isCalloutVisible: false,
      routeCoordinates: [],
      distanceTravelled: 0,
      prevLatLng: {},
      coordinate: new AnimatedRegion({
      latitude: LATITUDE,
      longitude: LONGITUDE
      })
    };
  }

  componentWillMount() {
    navigator.geolocation.getCurrentPosition(
      position => {},
      error => alert(error.message),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000
      }
    );
  }

  componentDidMount() {
    // this.timerID = setInterval(
		// 	() => this.tick(uid),
		// 	40000
    //   )
    const {coordinate} = this.state;
    this.watchPosition();
  }

  componentWillUnmount = () => {
		navigator.geolocation.clearWatch(this.watchID);
		//clearInterval(this.timerID);
  };

  watchPosition = () => {
    this.watchID = navigator.geolocation.watchPosition(
      position => {
        const JSONData = JSON.stringify(position);
        var ParsedData = JSON.parse(JSONData);
        const { coordinate, routeCoordinates, distanceTravelled } = this.state;
        const { latitude, longitude } = ParsedData.coords;

        const newCoordinate = {
          latitude,
          longitude
        };

        if (Platform.OS === "android") {
          if (this.marker) {
            this.marker._component.animateMarkerToCoordinate(
              newCoordinate,
              500
            );
          }
        } else {
          coordinate.timing(newCoordinate).start();
        }

        this.setState({
          latitude,
          longitude,
          routeCoordinates: routeCoordinates.concat([newCoordinate]),
          distanceTravelled:
            distanceTravelled + this.calcDistance(newCoordinate),
          prevLatLng: newCoordinate
        });
      },
      error => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
      
    }

  calcDistance = newLatLng => {
    const { prevLatLng } = this.state;
    return haversine(prevLatLng, newLatLng) || 0;
  };

  getMapRegion = () => ({
    latitude: this.state.latitude,
    longitude: this.state.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA
  });

  updateFirebaseCurrentLocation(uid, data) {
    
    var updates = {};
    updates['/Drivers/' + uid + '/currentLocation' + '/'] = data;

    return firebase.database().ref().update(updates);

  }  

  updateFirebase(uid, data) {
    
    var updates = {};
    updates['/Drivers/' + uid + '/distance_and_duration' + '/'] = data;

    return firebase.database().ref().update(updates);

  }



  render() {
    const { profile} = this.props
    const {currentLatitude, currentLongitude} = this.state;

    // var coords = [];
    // this.props.destinations.map(
    //   (data) => {coords.push(data.latlng);}
    // );
    // console.log(coords.length);
    return (
        <View style ={styles.container}>
        <MapView
					ref={ref => {
						this.map = ref;
					}}
					provider={PROVIDER_GOOGLE}
					style={styles.map}
          region={this.getMapRegion()}
          showUserLocation
          followUserLocation
          loadingEnabled
        >
          <Marker
            coordinate={ {latitude: currentLatitude, longitude: currentLongitude, } }
            
            image={require('../resources/images/you.png')}
            onPress={() => {this.setState({isCalloutVisible: !this.state.isCalloutVisible})}}
          >
            {this.state.isCalloutVisible ? 
              <MapView.Callout>
                  <View>
                      <Image source={{uri: profile.uri}} style={{height: 50, width: 50}}/>
                      <Text>{profile.name}</Text>
                  </View>
              </MapView.Callout>
              : 
              null
            }

          </Marker>

          <Polyline coordinates={this.state.routeCoordinates} strokeWidth={5} />
          <Marker.Animated
            ref={marker => {
              this.marker = marker;
            }}
            coordinate={this.state.coordinate}
            image={require('../resources/images/you.png')}
          />

          {priceZones.map(
              priceZone => (
                <Circle
                  center={priceZone.latlng}
                  radius={priceZone.radius}
                  fillColor={ priceZone.intensity == 'high' ? 'orange' : 'yellow'}
                  strokeColor={"#031430"}
                  strokeWidth={1.0}
                />
              ) )

            }
            
          
          
        </MapView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.bubble, styles.button]}>
            <Text style={styles.bottomBarContent}>
              {parseFloat(this.state.distanceTravelled).toFixed(2)} km
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
    container: {
        //...StyleSheet.absoluteFillObject,
        padding: 50,
        justifyContent: 'center',
        alignItems: 'center',
      },
      map: {
        //...StyleSheet.absoluteFillObject,
        width: width,
        height: 440,
      },
      bubble: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.7)",
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 20
      },
      latlng: {
        width: 200,
        alignItems: "stretch"
      },
      button: {
        width: 80,
        paddingHorizontal: 12,
        alignItems: "center",
        marginHorizontal: 10
      },
      buttonContainer: {
        flexDirection: "row",
        marginVertical: 20,
        backgroundColor: "transparent"
      }
})


// {this.props.destinations.map( 
//   marker => (
//     <Marker
//       coordinate={marker.latlng}
//       title={"Destination"}
//       image={require('../resources/images/destination.png')}
//     />
    
//   )
// )}
// {this.props.destinations.map(
//   marker => (
//     <Circle
//       center={marker.latlng}
//       radius={100}
//       fillColor={marker.done ? "#1350b2" : "#031430"}
//       strokeColor={marker.done ? "#61d8ab" : "#031430"}
//       strokeWidth={marker.done ? 1.0 : 0.5}
//     />
//   )
// )

// }

{/* <MapViewDirections
            origin={coords[0]}
            destination={coords[coords.length - 1]}
            waypoints={(coords.length > 2) ? coords.slice(1, -1): null}
            onReady={ (result) => {
              this.updateFirebase( uid, {duration: result.duration, distance: result.distance } )
            } }
            apikey={APIKey}
            strokeWidth={2}
            strokeColor="#e83e35"
          /> */}