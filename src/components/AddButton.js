import React, { Component } from 'react'
import { Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import ActionSheet from 'react-native-actionsheet'
import MyCustomCamera from './Camera.js'
import { withNavigation } from 'react-navigation';

class AddButton extends Component {
  constructor(props) {
    super(props);
    this.state = {cameraToggle: false};
  }

  showActionSheet() {
    console.log('adding Item')
    this.ActionSheet.show()

  }

  cameraOrGallery(index) {
    if (index === 0) {
      this.setState({cameraToggle: true});
      this.launchCamera();

    }
    else {this.launchGallery();}
  }

  launchCamera() {
    console.log('launching camera');
    this.props.navigation.navigate('Camera')
    //<MyCustomCamera />
    
  }

  launchGallery() {
    console.log('opening Photo Library');
  }

  render() {
    
    return (
      <View>
        <Icon.Button name='plus' onPress={() => this.showActionSheet() }>
          <Text>Add Picture of Item</Text>
        </Icon.Button>
        
          <ActionSheet
          ref={o => this.ActionSheet = o}
          title={'Choose picture selection option'}
          options={['Camera', 'PhotoLibrary', 'cancel']}
          cancelButtonIndex={2}
          destructiveButtonIndex={1}
          onPress={(index) => { console.log(index); this.cameraOrGallery(index) }}
          />
        
        
       
        </View>
        
      
      
    )
  }
}

export default withNavigation(AddButton)