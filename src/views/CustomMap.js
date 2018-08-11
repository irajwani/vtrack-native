import React, { Component } from 'react'
import { Text, StyleSheet, View } from 'react-native'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Marker, Callout } from 'react-native-maps';
//gmaps API key: "AIzaSyD2zYVyRTyNemGQtnrjsZnGGrR7R0knzMg"

export default class CustomMap extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
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
                            latitudeDelta: 0.015,
                            longitudeDelta: 0.0121,
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
