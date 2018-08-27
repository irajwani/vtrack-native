import React, { Component } from 'react'
import { Text, Image, StyleSheet, View, Dimensions } from 'react-native'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Marker, Callout, Circle } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import firebase from '../cloud/firebase.js';

const APIKey = "AIzaSyD2zYVyRTyNemGQtnrjsZnGGrR7R0knzMg";
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
//Icons made by SimpleIcon from wwww.flaticon.com is licensed by Creative Commons BY 3.0

export default class CustomMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isCalloutVisible: false,
    };
  }

  updateFirebase(data) {
    
    var updates = {};
    updates['/Drivers/' + firebase.auth().currentUser.uid + '/distance_and_duration' + '/'] = data;

    return firebase.database().ref().update(updates);

  }

  render() {
    var coords = [];
    this.props.destinations.map(
      (data) => {coords.push(data.latlng);}
    );
    console.log(coords.length);
    return (
        <View style ={styles.container}>
        <MapView
					ref={ref => {
						this.map = ref;
					}}
					provider={PROVIDER_GOOGLE}
					style={styles.map}
          region={{
                    latitude: this.props.location.latitude,
                    longitude: this.props.location.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                    }}
        >
          <Marker
            coordinate={this.props.location}
            
            image={require('../resources/images/you.png')}
            onPress={() => {this.setState({isCalloutVisible: !this.state.isCalloutVisible})}}
          >
            {this.state.isCalloutVisible ? <MapView.Callout>
                <View>
                    <Image source={{uri: this.props.data.profile.uri}} style={{height: 50, width: 50}}/>
                    <Text>{this.props.data.profile.name}</Text>
                </View>
            </MapView.Callout> : null}

          </Marker>
            
          {this.props.destinations.map( 
            marker => (
              <Marker
                coordinate={marker.latlng}
                title={"Destination"}
                image={require('../resources/images/destination.png')}
              />
              
            )
          )}
          {this.props.destinations.map(
            marker => (
              <Circle
                center={marker.latlng}
                radius={100}
                fillColor={marker.done ? "#1350b2" : "#031430"}
                strokeColor={marker.done ? "#61d8ab" : "#031430"}
                strokeWidth={marker.done ? 1.0 : 0.5}
              />
            )
          )

          }
          <MapViewDirections
            origin={coords[0]}
            destination={coords[coords.length - 1]}
            waypoints={(coords.length > 2) ? coords.slice(1, -1): null}
            onReady={ (result) => {
              this.updateFirebase( {duration: result.duration, distance: result.distance } )
            } }
            apikey={APIKey}
            strokeWidth={2}
            strokeColor="#e83e35"
          />
        </MapView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        height: 500,
        width: 400,
        justifyContent: 'flex-end',
        alignItems: 'center',
      },
      map: {
        ...StyleSheet.absoluteFillObject,
      },
})
