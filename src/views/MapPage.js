import React, { Component } from 'react'
import { Text, StyleSheet, View, Button } from 'react-native'
import { withNavigation } from 'react-navigation';
import firebase from '../cloud/firebase.js';
import CustomMap from './CustomMap.js';
import { database } from '../cloud/database.js';

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

class MapPage extends Component {
  constructor(props) {
      super(props);
      this.state = {
        isGetting: true,
        uid: '',
        profile: '',
        initialPosition: 'unknown',
        currentPosition: 'unknown',
        currentLatitude: 'unknown',
        currentLongitude: 'unknown',
        currentLocation: {lat: 25, lon: 25},
        data: '',
        buttonEnabled: true,
      }

  }

  getDriversProfile(uid) {
    database.then( (d) => {
      var profile = d.Drivers[uid].profile;
      this.setState({uid, profile});
    })
    .then( () => { this.setState( {isGetting: false} );  } )
    .catch( (err) => {console.log(err) })
  }

  tick(uid) {
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
      
      this.updateFirebaseCurrentLocation(uid, currentLocation);
	  
      });
      
	  }


 	componentDidMount() {
    
		//0. get initial time
   const {uid} = firebase.auth().currentUser
   this.getDriversProfile(uid);
	 this.timerID = setInterval(
			() => this.tick(uid),
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

  /////////////
  //don't need this function for this application
  confirmArrival(uid, data, currentLocation) {
    // if youve made it, then update 'done' to true
    var radius = 100;
    var condition;
    var location;
    
    for(let coord of data.coordinates) {
      location = {lat: coord.lat, lon: coord.lng};
      condition = glu.insideCircle(currentLocation, location, radius);
      if(condition) {
        coord.done = true;
        this.updateFirebase(uid, data);
      }
      
    }
    console.log( Object.values(data.coordinates)[0] );
    var locationsReached = 0;
    for (let coord of data.coordinates) {
      if(coord.done) {locationsReached++}
    }

    if( locationsReached == data.coordinates.length ) {
      data.routeFinished = true;
      data.timeFinished = new Date();
      data.timeOfJourney = this.diff_minutes( data.timeFinished, this.state.timeStarted );
      //metrics: 
      // 1. timeOfJourney versus duration - 3 horizontal bars
      //2. distance suggested by RN directions versus actual distance traveled
      //3. illustrate instances of deviations from prescribed route
      console.log(data);
      this.updateFirebase(uid, data);
    }

    //when they're all complete, set route to done
    //update firebase with new results

  }
  ///////////////

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
    const {uid, profile} = this.state;
    //var destinations = this.generateDestinations(data.coordinates);

    return (
      <View>
        
        <CustomMap 
          uid={uid}
          profile={profile}
          location={ {latitude: currentLatitude, longitude: currentLongitude, } }
         />

        {/* show driver profile pic avatar and details */}

        <View style={styles.header}>
          
            <View style={styles.profilepicWrap}>
            {profile.uri ? <Image style= {styles.profilepic} source={ {uri: profile.uri} }/>
          : <Image style= {styles.profilepic} source={require('../resources/images/nothing_here.png')}/>} 
            </View>
          

          <View style={styles.profileText}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.pos}>{profile.car} </Text>
            <Text style={styles.insta}>@{profile.country} </Text>
          </View>

          

        </View>

        <Button title="Verify arrival" onPress={ () => {
          //this.confirmArrival(uid, data, currentLocation);
          console.log('useless'); 
          } } />
        <Button 
          title="Begin Journey" 
          onPress={ () => {this.startTimer();} } 
          disabled={this.state.buttonEnabled ? false : true} />
        

      </View>
    )
  }
}

export default withNavigation(MapPage);

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  halfPageScroll: {
    
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    padding: 0
  },
  headerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-evenly'
  },

  profileText: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 10,

  },

  numberCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#cdcdd6',
    width: (width/2) - 20,
    height: 100,
    //55
    padding: 0,
    borderWidth: 0,
    borderColor: '#020202',
    borderRadius: 0,
  },

  subText: {
    fontFamily: 'Courier-Bold',
    fontSize: 20,
    fontWeight: '400'
  },

  midContainer: {
    flex: 0.5,
    //0.2
    padding: 0,
  },

  footerContainer: {
    flex: 0.5,
    flexDirection: 'column',
    padding: 2
  },

  headerBackground: {
    flex: 1,
    width: null,
    alignSelf: 'stretch',
    justifyContent: 'space-between'
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    //backgroundColor: 'black'
  },

  gear: {
    flex: 2,
  },
  gearAndPicRow: {
    flex: 2,
    flexDirection: 'row',
    paddingRight: 75,
  },
  profilepicWrap: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderColor: 'rgba(0,0,0,0.4)',
    borderWidth: 0,
  },
  profilepic: {
    flex: 1,
    width: null,
    alignSelf: 'stretch',
    borderRadius: 65,
    borderColor: '#fff',
    borderWidth: 0
  },
  name: {
    marginTop: 5,
    fontSize: 27,
    color: '#fff',
    fontWeight: 'normal'
  },
  numberProducts: {
    fontFamily: 'Arial',
    fontSize: 25,
    color: 'black',
    fontWeight: 'bold'
  },
  soldProducts: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold'
  }
  ,
  pos: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    fontStyle: 'italic'
  },
  insta: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    fontStyle: 'normal'
  },

  companyLogoContainer: {
    justifyContent: 'center',
    alignContent: 'center',
    backgroundColor: '#122021',
  },
  companyLogo: {
    //resizeMode: 'container',
    borderWidth:1,
    borderColor:'#207011',
    alignItems:'center',
    justifyContent:'center',
    width:40,
    height:40,
    backgroundColor:'#fff',
    borderRadius:0,
    borderWidth: 2,
    marginLeft: (width/4)-10,
    paddingLeft: 25,
    paddingRight: 25

}
})
