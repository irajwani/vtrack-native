import React, { Component } from 'react'
import { Text, StyleSheet, View, Button } from 'react-native'
import { withNavigation } from 'react-navigation';
import firebase from '../cloud/firebase.js';
import CustomMap from './CustomMap.js';

const glu = require('../components/geolocation-utils.js');

var initialPosition;
var currentLatitude;
var currentLongitude;
var currentLocation;
var your_location;

function setInitialPosition() {
  if (currentLatitude) {
    return null;
  }

  return { initialPosition };
}

class Home extends Component {
  constructor(props) {
      super(props);
      this.state = {
        initialPosition: 'unknown',
        currentPosition: 'unknown',
        currentLatitude: 'unknown',
        currentLongitude: 'unknown',
        currentLocation: {lat: 25, lon: 25},
        data: '',
        buttonEnabled: true,
      }

  }

  tick() {
		navigator.geolocation.getCurrentPosition(
			position => {
			  var JSONData = JSON.stringify(position);
			  var ParsedData = JSON.parse(JSONData);
        initialPosition = ParsedData.coords.latitude;
        this.setState({ setInitialPosition });
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
      currentLocation = {lat: currentLatitude, lon: currentLongitude};
      your_location = {currentLatitude, currentLongitude, currentLocation};
      
      this.updateFirebaseCurrentLocation(this.props.uid, currentLocation);
	  
      });
      
	  }


 	componentDidMount() {
    
		//0. get initial time
	
	 this.timerID = setInterval(
			() => this.tick(),
			40000
      ); 
      //In this case, simply increment the clock every 30 seconds
		
  }
  
  componentWillUnmount = () => {
		navigator.geolocation.clearWatch(this.watchID);
		//clearInterval(this.timerID);
  };

  diff_minutes(dt2, dt1) {

  var diff =(dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60;
  return Math.abs(Math.round(diff));
  
  }

  startTimer() {
    this.setState( {timeStarted: new Date(), buttonEnabled: false} )
  }

  confirmArrival(uid, data, currentLocation) {
    // if youve made it, then update 'done' to true
    var radius = 100;
    var condition;
    var location;
    var locationsReached = 0;
    for(let coord of data.coordinates) {
      location = {lat: coord.lat, lon: coord.lng};
      condition = glu.insideCircle(currentLocation, location, radius);
      if(condition) {
        coord.done = true;
        locationsReached++;
        this.updateFirebase(uid, data);
      }
      
    }
    console.log(data.coordinates);
    if(locationsReached == data.coordinates.length) {
      data.routeFinished = true;
      data.timeFinished = new Date();
      data.timeOfJourney = this.diff_minutes( data.timeFinished, this.state.timeStarted );
      console.log(data);
      this.updateFirebase(uid, data);
    }

    //when they're all complete, set route to done
    //update firebase with new results

  }

  updateFirebase(uid, data) {
    
    var updates = {};
    updates['/Drivers/' + uid + '/'] = data;

    return firebase.database().ref().update(updates);

  }

  updateFirebaseCurrentLocation(uid, data) {
    
    var updates = {};
    updates['/Drivers/' + uid + '/currentLocation' + '/'] = data;

    return firebase.database().ref().update(updates);

  }

  generateDestinations(coords) {
    var destinations = [];
    for(let i = 0; i < coords.length; i++) {
      destinations.push( {latlng: {latitude: coords[i].lat, longitude: coords[i].lng} , done: coords[i].done } );
    }
    console.log(destinations);
    return destinations;
  }

  render() {
    console.log(this.props.data)
    var destinations = this.generateDestinations(this.props.data.coordinates);

    return (
      <View>
        
        <Text> You need to leave by: </Text>
        <Text>{this.props.data.time}</Text>
        <CustomMap 
          location={ {latitude: currentLatitude, longitude: currentLongitude, } }
          destinations={destinations}
         />

        <Button title="Verify arrival" onPress={ () => {this.confirmArrival(this.props.uid, this.props.data, currentLocation); } } />
        <Button 
          title="Begin Journey" 
          onPress={ () => {this.startTimer();} } 
          disabled={this.state.buttonEnabled ? false : true} />

      </View>
    )
  }
}

export default withNavigation(Home);

const styles = StyleSheet.create({})
