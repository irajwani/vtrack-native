/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { StackNavigator } from 'react-navigation';
import SignIn from './src/views/SignIn';
import Home from './src/views/Home';
import CustomMap from './src/views/CustomMap';


var firebase = require('firebase')

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

const RootStack = StackNavigator( 
  {

    login: {
      screen: SignIn

    },

    home: {
      screen: Home
    },

    map: CustomMap


  }
  ,
  {
    initialRouteName: 'login',
    // the shared navigationOptions, which we can always override within the component
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#800000',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontFamily: 'American Typewriter'
      },
    },
  }
  );


export default class App extends Component {

  

  render() {
    console.disableYellowBox = true
    console.log('starting app');
    return <RootStack />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
