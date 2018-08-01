import React, { Component } from 'react'
import { Text, StyleSheet, View, Button } from 'react-native'
import { withNavigation } from 'react-navigation';
import firebase from '../cloud/firebase.js';
const glu = require('../components/geolocation-utils.js');

var currentLatitude;
var currentLongitude;

class Home extends Component {
  constructor(props) {
      super(props);
      this.state = {
        initialPosition: 'unknown',
        currentPosition: 'unknown',
        currentLatitude: null,
        currentLongitude: null,
        currentLocation: {lat: 25, lon: 25}
      }

  }

  tick() {
		navigator.geolocation.getCurrentPosition(
			position => {
			  var JSONData = JSON.stringify(position);
			  var ParsedData = JSON.parse(JSONData);
			  const initialPosition = ParsedData.coords.latitude;
			  
			  this.setState({ initialPosition });
			},
			error => alert(error.message),
			{
			  enableHighAccuracy: true,
			  timeout: 20000,
			  maximumAge: 10,
			  distanceFilter: 2,
			}
		  );
		  //2. Watch the user's location for changes
		  this.watchID = navigator.geolocation.watchPosition(position => {
			const JSONData = JSON.stringify(position);
			var ParsedData = JSON.parse(JSONData);
			currentLatitude = ParsedData.coords.latitude;
			currentLongitude = ParsedData.coords.longitude;
		  
	  
			this.setState({
			  currentLatitude: currentLatitude,
			  currentLongitude: currentLongitude,
			  currentLocation: {lat: currentLatitude, lon: currentLongitude},
			  isLoading: false
			});
			
	  
		  });
		this.setState({
		  currentTime: new Date()
		});
	  }


 	componentDidMount() {
		//0. get initial time
	
	 this.timerID = setInterval(
			() => this.tick(),
			10000
		  ); //In this case, simply increment the clock every 10 seconds
		
  }
  
  componentWillUnmount = () => {
		navigator.geolocation.clearWatch(this.watchID);
		clearInterval(this.timerID);
  };

  confirmArrival = (uid, data, currentLocation) => {
    // if youve made it, then update 'done' to true
    var coords = data.coords;
    console.log(coords.length);
    console.log(typeof data);
    var radius = 30;
    var condition;
    var location;
    let locationsReached = 0;
    for(let coord of coords) {
      location = {lat: coord.lat, lon: coord.lng};
      condition = glu.insideCircle(currentLocation, location, radius);
      if(condition) {
        coord.done = true;
        locationsReached++;
      }
      
    }

    if(locationsReached == coords.length) {
      Object.assign( {routeFinished: true, timeFinished: new Date()}, data)
    }

    this.updateFirebase(uid, data)
    
    //when they're all complete, set route to done
    //update firebase with new results

  }

  updateFirebase = (uid, data) => {
    
    var updates = {};
    updates['/Drivers/' + uid + '/'] = data;

    return firebase.database().ref().update(updates);

  }

  render() {
    
    return (
      <View>
        
        <Text> You need to leave by: </Text>
        <Text>{this.props.data.time}</Text>

        <Button title="Verify arrival" onPress={this.confirmArrival(this.props.uid, this.props.data, this.state.currentLocation )} />

      </View>
    )
  }
}

export default withNavigation(Home);

const styles = StyleSheet.create({})
