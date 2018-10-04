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
import InitialScreen from './src/views/InitialScreen.js'

import {Provider} from 'react-redux'
import {createStore} from 'redux'
import reducer from './src/store/reducer.js'

const store = createStore(reducer);

export default class App extends Component {

  render() {
    console.disableYellowBox = true
    console.log('starting app');
    return (
      <Provider store={store}>
          <InitialScreen />
      </Provider> 
    )
  }
}

// import { StackNavigator } from 'react-navigation';
// import SignIn from './src/views/SignIn';
// import EditProfile from './src/views/EditProfile'
// import MapPage from './src/views/MapPage';
// import CustomMap from './src/views/CustomMap';
// import MyCustomCamera from './src/components/Camera';
// import AddButton from './src/components/AddButton';
// import Dashboard from './src/views/Dashboard';

// const RootStack = StackNavigator( 
//   {

//     login: {
//       screen: SignIn

//     },

//     dashboard: Dashboard,

//     editprofile: EditProfile,

//     mappage: {
//       screen: MapPage
//     },

//     map: CustomMap,

//     addbutton: AddButton,

//     camera: MyCustomCamera


//   }
//   ,
//   {
//     initialRouteName: 'login',
//     // the shared navigationOptions, which we can always override within the component
//     navigationOptions: {
//       headerStyle: {
//         backgroundColor: '#800000',
//       },
//       headerTintColor: '#fff',
//       headerTitleStyle: {
//         fontWeight: 'bold',
//         fontFamily: 'American Typewriter'
//       },
//     },
//   }
//   );


