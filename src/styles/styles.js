import {StyleSheet, Dimensions} from 'react-native'
import { material, iOSColors, human } from 'react-native-typography';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({

  //SIGNIN OR SIGNUP Page
    firstContainer: {
      flex: 1,
      // marginTop: 5,
      //marginBottom: 5,
      padding: 40,
      flexDirection: 'column',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      //alignContent
      backgroundColor: '#122021',
      //#fff
    },

  //SIGN IN PAGE
    signInContainer: {
      flex: 1,
      // marginTop: 5,
      //marginBottom: 5,
      padding: 20,
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignContent: 'center',
      backgroundColor: '#122021',
      //#fff
    },
    companyLogoContainer: {
      justifyContent: 'center',
      alignContent: 'center',
      backgroundColor: '#122021'
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
    ,
    container: {
      alignItems: 'stretch',
      flex: 1
    },
    body: {
      flex: 9,
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'center',
      backgroundColor: '#F5FCFF',
    },
    inputStyle: {
         paddingRight: 5,
         paddingLeft: 5,
         paddingBottom: 2,
         color: 'blue',
         fontSize: 18,
         fontWeight: '200',
         flex: 2,
         height: 100,
         width: 300,
         borderColor: 'gray',
         borderWidth: 1,
  },
  
  
     containerStyle: {
         height: 45,
         flexDirection: 'column',
          alignItems: 'flex-start',
          width: '75%',
          borderColor: 'gray',
         borderBottomWidth: 1,
     },
    aicontainer: {
      flex: 1,
      justifyContent: 'center'
    }
    ,
    horizontal: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 10
    }
    ,
    toolbar: {
          height: 56,
      backgroundColor: '#e9eaed',
    },
    textInput: {
      height: 40,
      width: 200,
      borderColor: 'red',
      borderWidth: 1
    },
    transparentButton: {
      marginTop: 10,
      padding: 15
    },
    transparentButtonText: {
      color: '#0485A9',
      textAlign: 'center',
      fontSize: 16
    },
    primaryButton: {
      margin: 10,
      padding: 15,
      backgroundColor: '#529ecc'
    },
    primaryButtonText: {
      color: '#FFF',
      textAlign: 'center',
      fontSize: 18
    },
    image: {
      width: 100,
      height: 100
    },


    





  });
  
  export default styles