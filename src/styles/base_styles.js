import {
    StyleSheet
  } from 'react-native';
  
  const styles = StyleSheet.create({
    signInContainer: {
      flex: 1,
      marginTop: 5,
      marginBottom: 5,
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: '#fff',
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
    labelStyle: {
  
    }
      ,
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
    }
  });
  
  export default styles