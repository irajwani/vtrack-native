import React, { Component } from 'react'
import { Text, View } from 'react-native'
import SignInOrSignUp from './SignInOrSignUp';
import SignIn from './SignIn';

import firebase from '../cloud/firebase';

import {connect} from 'react-redux';
import MapPageAndDashboardTab from '../tabNavigators/mapPageAndDashboardTab';

class InitialScreen extends Component {
  constructor(props) {
      super(props);
      this.state = {
        //currentComponent: <SignIn/>,
      };
  }
//   componentDidMount() {
//     firebase.auth().onAuthStateChanged( user => {
//         this.setState({loggedIn: user.uid ? true : false});
//         //this.setState({ currentComponent: user.uid ? <HomeScreen/> : <SignIn/> })
//     })
//   }

  render() {
    const {uid, loggedIn, showSignIn} = this.props;
    
    if(loggedIn) {
        return <MapPageAndDashboardTab/>
    }
    
    if (showSignIn){
        return <SignIn />
    } 
    
    return <SignInOrSignUp/>
    

    
    
    
  }
}

// this feeds the singular store whenever the state changes
const mapStateToProps = (state) => {
    return {
        loading: state.loading,
        loggedIn: state.loggedIn,
        showSignIn: state.showSignIn,
    }
}

    //if we want a component to access the store, we need to map actions to the props
const mapDispatchToProps = (dispatch) => {
    return {
        //just a func to handle authentication, change the application state and store the UID
        onSignInPress: (email, pass) => dispatch( {type: 'onSignInPress', email: email, pass: pass } ),
        showSignIn: () => dispatch( {type: 'showSignIn' } ),
    }
}

//export default connect(mapStateToProps, mapDispatchToProps)(InitialScreen)