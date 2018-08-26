import React, { Component } from 'react'
import { KeyboardAvoidingView, View, Text, Button, Image, TouchableHighlight, ActivityIndicator } from 'react-native';
import { Hoshi, Jiro } from 'react-native-textinput-effects';
import {withNavigation, StackNavigator} from 'react-navigation'; // Version can be specified in package.json
import { PulseIndicator } from 'react-native-indicators';

import firebase from '../cloud/firebase.js'
import styles from '../styles/base_styles.js'

import MapPage from './MapPage.js'

class SignIn extends Component {

    constructor(props) {
      super(props);
      this.state = { data: '', test: 3, email: '', uid: '', pass: '', error: '', loading: false, loggedIn: false, isGetting: true};
      }
    /////////
    ///////// Hello world for Login/Signup Email Authentication
    onSignInPress() {
        this.setState({ error: '', loading: true });
        const { email, pass } = this.state; //now that person has input text, their email and password are here
        firebase.auth().signInWithEmailAndPassword(email, pass)
            .then(() => { this.setState({ error: '', loading: false });
                          this.authChangeListener();
                          //cant do these things:
                          //firebase.database().ref('Users/7j2AnQgioWTXP7vhiJzjwXPOdLC3/').set({name: 'Imad Rajwani', attended: 1});
                          }).catch(() => {
                firebase.auth().createUserWithEmailAndPassword(email, pass)
                    .then(() => { this.setState({ error: '', loading: false });
                                  this.authChangeListener();  }
                                      )
                    .catch(() => {
                      // console.log( 'registration error', error )
                      // if (error.code === 'auth/email-already-in-use') {
                      //       var credential = firebase.auth.EmailAuthProvider.credential(email, password);
                      //
                      //
                      // }

                      this.setState({ error: 'Authentication failed, booo hooo.', loading: false });
                    });
            });

    }

    getData(snapshot) {
        data = {
            coords: null,
            time: new Date()
        };
        
        data.coordinates = snapshot.val().coordinates
        data.time = snapshot.val().time
        
        this.setState({data, isGetting: false});
    }


    authChangeListener() {

        firebase.auth().onAuthStateChanged( (user) => {
            if (user) {
                var name = 'nothing here';
                

                firebase.database().ref('Drivers/' + user.uid + '/').once('value', this.getData.bind(this), function (errorObject) {
                    console.log("The read failed: " + errorObject.code);
                  });
                this.setState({uid: user.uid, loggedIn: true});
                //console.log(this.state.name);
                //alert(this.state.uid);
                //return this.props.navigation.navigate('ga', {userid: this.state.uid});
                //if (this.state.isGetting == false) {return this.props.navigation.navigate('ga', {data: this.state.data, attended: this.state.details.attended, name: this.state.details.name, userid: this.state.uid}); //abandon forced navigation. conditional render
            
                
            } else {
              alert('no user found');
            }


        } )


                  }


    renderButtonOrLoading() {
        if (this.state.loading) {
            return <View style={{flex: 1}}>
                        <ActivityIndicator size='large' color="#0000ff"/>
                   </View>
        }
        return <Button
                    title='Sign In' 
                    onPress={this.onSignInPress.bind(this)} />;
    }

    ///////////////////
    //////////////////

    render() 
     {
        //  const a = [1,4,2,3,4];
        //  const maxNum = Math.max(...a);
        //  console.log(a.filter( num => num == maxNum ).length);
    
    if(this.state.isGetting == false) 
         {
          console.log(this.state.data); 
          return(<MapPage uid={this.state.uid} data={this.state.data}/>)
         }
    else {return (
            
        <KeyboardAvoidingView behavior='padding'
        style={styles.signInContainer}>
                  {/* <TextInputField
                      label='Email Address'
                      placeholder='youremailaddress@bates.edu'
                      value={this.state.email}
                      onChangeText={email => this.setState({ email })}
                      autoCorrect={false}
                  />
                  <TextInputField
                      label='Password'
                      autoCorrect={false}
                      placeholder='Your Password'
                      secureTextEntry
                      value={this.state.pass}
                      onChangeText={pass => this.setState({ pass })}
                  />
                  <Text>{this.state.error}</Text> */}
                  
                <Hoshi
                    label={'Drivers Email Address'}
                    value={this.state.email}
                    onChangeText={email => this.setState({ email })}
                    autoCorrect={false}
                    // this is used as active border color
                    borderColor={'#800000'}
                    // this is used to set backgroundColor of label mask.
                    // please pass the backgroundColor of your TextInput container.
                    backgroundColor={'#F9F7F6'}
                    inputStyle={{ color: '#800000' }}
                />
                <Hoshi
                    label={'Super Secret Password'}
                    value={this.state.pass}
                    onChangeText={pass => this.setState({ pass })}
                    autoCorrect={false}
                    secureTextEntry
                    // this is used as active border color
                    borderColor={'#000099'}
                    // this is used to set backgroundColor of label mask.
                    // please pass the backgroundColor of your TextInput container.
                    inputStyle={{ color: '#800000' }}
                />
                  {this.renderButtonOrLoading()}
                
          
          </KeyboardAvoidingView>
                  )


                }

        
    }

}

export default withNavigation(SignIn)