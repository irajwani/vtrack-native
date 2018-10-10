import React, { Component } from 'react'
import { Text, Image, TouchableOpacity, StyleSheet, View, Dimensions, Platform } from 'react-native'
import * as RNEP from "@estimote/react-native-proximity";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Button } from 'react-native-elements';
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
      zoneOne: false,
      zoneTwo: false,
      journeyBegun: false,
      latitude: LATITUDE,
      longitude: LONGITUDE,
      isCalloutVisible: false,
      routeCoordinates: [],
      routeCoordinatesWhileInProximity: [],
      distanceTravelled: 0,
      distanceTravelledWhileInProximity: 0,
      prevLatLng: {},
      coordinate: new AnimatedRegion({
      latitude: LATITUDE,
      longitude: LONGITUDE
      })
    };
    //Putting in constructor works;
    // will trigger when the user is within ~ 5 m of any beacon with tag "lobby"
    // you can add tags to your beacons on https://cloud.estimote.com, in Beacon Settings
    const zone1 = new RNEP.ProximityZone(2, "car");
    zone1.onEnterAction = context => {
      this.setState({zoneOne: true})
      // context properties are:
      // - attachments: all the key-value attachments assigned in Estimote Cloud to the beacon that triggered the action
      // - tag: the tag used when defining the zone, repeated here for convenience
      // - deviceIdentifier: Estimote-specific device identifier of the beacon that triggered the action
      console.log("zone1 onEnter", context);
    };
    zone1.onExitAction = context => {
      this.setState({zoneOne: false})
      console.log("zone1 onExit", context);
    };
    zone1.onChangeAction = contexts => {
      // onChange event gives you granular data about which exact beacons are in range
      //
      // imagine there are 2 beacons tagged "lobby", to help cover the entire lobby area; here's an example sequence of events:
      //
      // 1. when you enter the range of the 1st one, you'll get:
      // lobby onEnter
      // lobby onChange with array [beacon1's context]
      //
      // 2. when you enter the range of the 2nd one, and are still in range of the 1st one:
      // lobby onChange with array [beacon1's context, beacon2's context]
      //
      // 3. when you exit the range of the 1st one, but are still in range of the 2nd one:
      // lobby onChange with array [beacon2's context]
      //
      // 4. when you finally exit the range of the 2nd one:
      // lobby onChange with empty array []
      // lobby onExit
      console.log("zone1 onChange", contexts);
    };

    const zone2 = new RNEP.ProximityZone(2, "ad");
    zone2.onEnterAction = context => {
      this.setState({zoneTwo: true})
      console.log("zone2 onEnter", context);
    };
    zone2.onExitAction = context => {
      this.setState({zoneTwo: false})
      console.log("zone2 onExit", context);
    };
    zone2.onChangeAction = contexts => {
      console.log("zone2 onChange", contexts);
    };

        // detecting proximity to Bluetooth beacons gives you information about the user's location, and so
      // on both iOS and Android it's required to ask the user for permission to do that
      //
      // - on iOS, the user can choose between "never", "only when using the app" and "always" (background)
      //   - however, background support also requires that you enable the "Uses Bluetooth LE accessories"
      //     Background Mode for your app
      //   - you can do that in Xcode project settings, on the Capabilities tab
      //   - you might also need to explain/defend your app's background usage during the App Store review
      //
      // - on Android, it'll be a simple "yes/no" popup, which is equivalent to "never" and "always"
      //   - however, to have it work in the background, you're also required to show a notification, so
      //     that the user knows that the app keeps running/detecting beacons even if they close it
      //   - see the `config` section below for how to enable/configure such notification
      //
      // see also: "Location permission" and "Background support" sections in the README
      RNEP.locationPermission.request().then(
        permission => {
          // `permission` will be one of RNEP.locationPermission.DENIED, .ALWAYS, or .WHEN_IN_USE
          console.log(`location permission: ${permission}`);

          if (permission !== RNEP.locationPermission.DENIED) {
            // generate Estimote Cloud credentials for your app at:
            // https://cloud.estimote.com/#/apps/add/your-own-app
            const credentials = new RNEP.CloudCredentials(
              "eazyad-o2p",
              "846f510733f7a45fd316350b724f9ca2"
            );

            const config = {
              // modern versions of Android require a notification informing the user that the app is active in the background
              // if you don't need proximity observation to work in the background, you can omit the entire `notification` config
              //
              // see also: "Background support" section in the README
              notification: {
                title: "Exploration mode is on",
                text: "We'll notify you when you're next to something interesting.",
                //icon: 'my_drawable', // if omitted, will default to the app icon (i.e., mipmap/ic_launcher)

                // in apps targeting Android API 26, notifications must specify a channel
                // https://developer.android.com/guide/topics/ui/notifiers/notifications#ManageChannels
                channel: {
                  id: "exploration-mode",
                  name: "Exploration Mode"
                }
              }
            };

            RNEP.proximityObserver.initialize(credentials, config);
            RNEP.proximityObserver.startObservingZones([zone1, zone2]);
          }
        },
        error => {
          console.error("Error when trying to obtain location permission", error);
        }
      );

  }

  componentWillMount() {
    setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        position => {
          const JSONData = JSON.stringify(position);
          var ParsedData = JSON.parse(JSONData);
          const { latitude, longitude } = ParsedData.coords;
          this.setState({
            latitude,
            longitude,
          });
        },
        error => alert(error.message),
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 1000
        }
      );
    }, 999);
  }

  // componentDidMount() {
  //   const {coordinate} = this.state;
  //   this.watchPosition();  
  // }

  componentWillUnmount = () => {
		navigator.geolocation.clearWatch(this.watchID);
		//clearInterval(this.timerID);
  };

  watchPosition = (zoneOne, zoneTwo) => {
    this.watchID = navigator.geolocation.watchPosition(
      position => {
        const JSONData = JSON.stringify(position);
        var ParsedData = JSON.parse(JSONData);
        const { coordinate, routeCoordinates, routeCoordinatesWhileInProximity, distanceTravelled, distanceTravelledWhileInProximity } = this.state;
        const { latitude, longitude } = ParsedData.coords;

        const newCoordinate = {
          latitude,
          longitude
        };

        //const duration = 500;

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

        if(zoneOne && zoneTwo) {
          this.setState({
            journeyBegun: true,
            latitude,
            longitude,
            routeCoordinates: routeCoordinates.concat([newCoordinate]),
            routeCoordinatesWhileInProximity: routeCoordinatesWhileInProximity.concat([newCoordinate]),
            distanceTravelled: distanceTravelled + this.calcDistance(newCoordinate),
            //I feel this will still calculate total distance travelled
            distanceTravelledWhileInProximity: distanceTravelledWhileInProximity + this.calcDistance(newCoordinate),
            prevLatLng: newCoordinate
          });
        } 
        else {
          this.setState({
            journeyBegun: true,
            latitude,
            longitude,
            routeCoordinates: routeCoordinates.concat([newCoordinate]),
            distanceTravelled: distanceTravelled + this.calcDistance(newCoordinate),
            prevLatLng: newCoordinate
          });
        }
        console.log(this.state);
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

  beginJourney() {
    console.log('driver has decided to begin journey');
    var initialTime = new Date(Date.now());
    this.setState({initialTime});
    const {latitude, longitude, zoneOne, zoneTwo} = this.state;
    this.watchPosition(zoneOne, zoneTwo);
    
    
  }

  endJourney() {
    console.log('driver has finished journey, save information thus far, and upload info');
    const {initialTime, routeCoordinates, routeCoordinatesWhileInProximity} = this.state;
    console.log(this.state)
    var finishTime = new Date(Date.now());
    var journeyUpdates = {};
    var postData = {
      initialTime,
      finishTime,
      routeCoordinates: routeCoordinates,
      routeCoordinatesWhileInProximity: routeCoordinatesWhileInProximity
    }
    journeyUpdates['/Drivers/' + firebase.auth().currentUser.uid + '/journeys/' + finishTime + '/'] = postData;
    firebase.database().ref().update(journeyUpdates);
  }

  render() {
    const { profile} = this.props
    const {latitude, longitude, zoneOne, zoneTwo} = this.state; //current coordinates
    // var coords = [];
    // this.props.destinations.map(
    //   (data) => {coords.push(data.latlng);}
    // );
    // console.log(coords.length);
    return (
        <View style ={styles.container}>
          {/* proximity sensor */}
         <View style={{flexDirection: 'row', }}>
            {zoneOne && zoneTwo ? 
            <View style={{flexDirection: 'column', alignItems: 'center'}}>
              <Icon name="access-point" 
                          size={40} 
                          color='blue'
                          onPress={() => {}}

              />
              <Button
                title='Begin journey' 
                titleStyle={{ fontWeight: "700" }}
                buttonStyle={{
                backgroundColor: '#368c93',
                //#2ac40f
                width: 120,
                height: 45,
                borderColor: "#226b13",
                borderWidth: 0,
                borderRadius: 30
                }}
                containerStyle={{ padding: 10, marginTop: 5, marginBottom: 5 }} 
                onPress={() => this.beginJourney()}
              />
              <Button
                title='End journey' 
                titleStyle={{ fontWeight: "700" }}
                buttonStyle={{
                backgroundColor: 'red',
                //#2ac40f
                width: 120,
                height: 45,
                borderColor: "#226b13",
                borderWidth: 0,
                borderRadius: 30
                }}
                containerStyle={{ padding: 10, marginTop: 5, marginBottom: 5 }} 
                onPress={() => this.endJourney()}
              />
            </View>  
              : 
              <Icon name="access-point" 
                          size={40} 
                          color='gray'
                          onPress={() => {}}

              />
            }
          </View>

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

          {this.state.journeyBegun ? <Polyline coordinates={this.state.routeCoordinates} strokeWidth={5} /> : null}

          <Marker.Animated
            ref={marker => {
              this.marker = marker;
            }}
            coordinate={{latitude: latitude, longitude: longitude, }}
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

{/* <Marker
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

</Marker> */}

{false ? 
  <Button
    title='End journey' 
    titleStyle={{ fontWeight: "700" }}
    buttonStyle={{
    backgroundColor: 'black',
    //#2ac40f
    width: 40,
    height: 45,
    borderColor: "#226b13",
    borderWidth: 0,
    borderRadius: 30
    }}
    containerStyle={{ padding: 10, marginTop: 5, marginBottom: 5 }} 
    onPress={() => this.endJourney()} />  
  :
  <Button
    title='Begin journey' 
    titleStyle={{ fontWeight: "700" }}
    buttonStyle={{
    backgroundColor: '#368c93',
    //#2ac40f
    width: 120,
    height: 45,
    borderColor: "#226b13",
    borderWidth: 0,
    borderRadius: 30
    }}
    containerStyle={{ padding: 10, marginTop: 5, marginBottom: 5 }} 
    onPress={() => this.beginJourney()}
  />  
}