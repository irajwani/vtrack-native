import React, { Component } from 'react'
import { Text, StyleSheet, View, Dimensions } from 'react-native'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Marker, Callout } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

const APIKey = "AIzaSyD2zYVyRTyNemGQtnrjsZnGGrR7R0knzMg";
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;


export default class CustomMap extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    //console.log((this.props.destinations.length > 2) ? this.props.destinations.slice(1, -1).latlng: null);
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
            title={"This is You"}
            image={require('../resources/images/you.png')}
          />
          {this.props.destinations.map( 
            marker => (
              <Marker
                coordinate={marker.latlng}
                title={"Destination"}
              />
            )

          )}
          <MapViewDirections
            origin={coords[0]}
            destination={coords[coords.length - 1]}
            waypoints={(coords.length > 2) ? coords.slice(1, -1): null}
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
        height: 300,
        width: 300,
        justifyContent: 'flex-end',
        alignItems: 'center',
      },
      map: {
        ...StyleSheet.absoluteFillObject,
      },
})
