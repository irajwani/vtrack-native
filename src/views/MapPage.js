import React, { Component } from 'react'
import { Text, StyleSheet, View, Dimensions, Image, Button } from 'react-native'
import { withNavigation } from 'react-navigation';
import firebase from '../cloud/firebase.js';
import CustomMap from './CustomMap.js';
import { database } from '../cloud/database.js';
const glu = require('../components/geolocation-utils.js');

const {width} = Dimensions.get('window');


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
        buttonEnabled: true,
      }

  }

 	componentWillMount() {
    
    setTimeout(() => {
      const uid = firebase.auth().currentUser.uid;
      console.log(uid);
      this.getDriversProfile(uid);
    }, 1000);
   
		
  }

  getDriversProfile(uid) {
    database.then( (d) => {
      console.log(d);
      var profile = d.Drivers[uid].profile;
      console.log(profile);
      this.setState({uid, profile});
    })
    .then( () => { this.setState( {isGetting: false} );  } )
    .catch( (err) => {console.log(err) })
  }

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
    updates['/Users/' + uid + '/'] = data;

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
    const {isGetting, profile,} = this.state;
    //var destinations = this.generateDestinations(data.coordinates);

    if(isGetting) {
      return (<View><Text>Loading...</Text></View>)
    }

    return (
      <View>

        {/* show driver profile pic avatar and details */}

        <View style={styles.header}>
          
          <View style={styles.profilepicWrap}>
          {profile.uri ? 
            
            <Image style= {styles.profilepic} source={ {uri: profile.uri} }/>
            :
            <Image style= {styles.profilepic} source={require('../resources/images/nothing_here.png')}/>
          }
           
          <View style={styles.profileText}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.pos}>{profile.car} </Text>
            <Text style={styles.insta}>@{profile.country} </Text>
            
          </View>
          

           
        </View>
        

        

        

      </View>

      
        
        <CustomMap 
          profile={profile}
         />

        

      </View>
    )
  }
}

export default MapPage;

{/* <Button 
        title="Begin Journey" 
        onPress={ () => {this.startTimer();} } 
        disabled={this.state.buttonEnabled ? false : true} /> */}

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
    //flex: 1,
    padding: 5,
    flexDirection: 'column',
    alignItems: 'center',
    //paddingTop: 10,

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
    marginTop: 10,
    padding: 10,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
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
    flexDirection: 'row',
    width: 200,
    height: 30,
    borderRadius: 0,
    borderColor: 'rgba(0,0,0,0.4)',
    borderWidth: 0,
  },
  profilepic: {
    //flex: 1,
    width: 80,
    height: 80,
    //width: null,
    //alignSelf: 'stretch',
    borderRadius: 40,
    borderColor: '#fff',
    borderWidth: 0
  },
  name: {
    
    fontSize: 15,
    color: 'black',
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
    fontSize: 10,
    color: 'purple',
    fontWeight: '600',
    fontStyle: 'italic'
  },
  insta: {
    fontSize: 10,
    color: 'orange',
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
