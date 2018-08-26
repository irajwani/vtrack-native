import React, { Component } from 'react'
import { Text, StyleSheet, View, ActivityIndicator, TouchableHighlight, Image } from 'react-native'
import { RNCamera } from 'react-native-camera';
import { withNavigation } from 'react-navigation';


class MyCustomCamera extends Component {

  constructor(props) {
      super(props);
      this.state = {
        isLoading: false,
        type: RNCamera.Constants.Type.back,
        
        pictureuri: null,
    }
  }
  
  takePicture() {
    this.setState({isLoading: true});
    let self = this;
    console.log('first')
    const options = { quality: 0.5, base64: true };
    this.camera.takePictureAsync(options).then((image64) => {
        this.setState({
            isLoading: false, pictureuri: image64.uri, picturebase64: image64.base64, pictureWidth: image64.width, pictureHeight: image64.height
        });
        this.props.navigation.navigate('editprofile' , {uri: this.state.pictureuri, base64: this.state.picturebase64, width: this.state.pictureWidth, height: this.state.pictureHeight})
    }).catch(err => console.error(err))

  }
  
  render() {
    return (
        <View style={styles.container}>

        <RNCamera
            ref={ref => {
              this.camera = ref;
            }}

            style = {styles.preview}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.auto}
            permissionDialogTitle={'Permission to use camera'}
            permissionDialogMessage={'We need your permission to use your camera phone'}
        >
          <View style={styles.cambuttons}>
              <TouchableHighlight style={styles.capture} onPress={this.takePicture.bind(this) } >
                <Image
                  style={{width: 20, height: 20, opacity: 0.7}}
                  source={require('../resources/images/cb.png')}
                 />

              </TouchableHighlight>

          <ActivityIndicator animating={this.state.isLoading} color='#0040ff' size='large'/>

          </View>


        </RNCamera>

      </View>
    )
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black'
      },
      preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
      },
      cambuttons: {
        flexDirection: 'row',
        justifyContent: 'center'
      },
      capture: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20
      }
})
export default withNavigation(MyCustomCamera)