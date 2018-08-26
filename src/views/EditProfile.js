import React, { Component } from 'react'
import { Text, StyleSheet, View, Platform } from 'react-native';
import {withNavigation, StackNavigator} from 'react-navigation'; // Version can be specified in package.json
import {ButtonGroup, Button} from 'react-native-elements';
import { Jiro } from 'react-native-textinput-effects';
import firebase from '../cloud/firebase.js';
import RNFetchBlob from 'react-native-fetch-blob';
import AddButton from '../components/AddButton';

const Blob = RNFetchBlob.polyfill.Blob;
const fs = RNFetchBlob.fs;
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = Blob;

class EditProfile extends Component {
  constructor(props) {
      super(props);
      this.state = {
          name: '',
      }
  }

  updateFirebase = (uid, data, uri, mime = 'image/jpg') => {
    var updates = {};
    console.log(uri);

    updates['/Drivers/' + uid + '/profile/'] = data;

    return {database: firebase.database().ref().update(updates), 
            storage: new Promise((resolve, reject) => {
                        const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
                        let uploadBlob = null
                        const imageRef = firebase.storage().ref().child(`Drivers/${uid}/`);
                        fs.readFile(uploadUri, 'base64')
                        .then((data) => {
                        return Blob.build(data, { type: `${mime};BASE64` })
                        })
                        .then((blob) => {
                        console.log('got to blob')
                        uploadBlob = blob
                        return imageRef.put(blob, { contentType: mime })
                        })
                        .then(() => {
                        uploadBlob.close()
                        return imageRef.getDownloadURL()
                        })
                        .then((url) => {
                        resolve(url)
                        })
                        .catch((error) => {
                        reject(error)
                        })
                    })
}
  }
  render() {
    console.log('Editing Profile..')
    const uid = firebase.auth().currentUser.uid;
    const {params} = this.props.navigation.state
    const pictureuri = params ? params.uri : 'nothing here'
    const picturebase64 = params ? params.base64 : 'nothing here'

    return (
      <View>
        <Jiro
                    label={'FirstName LastName'}
                    value={this.state.name}
                    onChangeText={name => this.setState({ name })}
                    autoCorrect={false}
                    // this is used as active border color
                    borderColor={'#800000'}
                    // this is used to set backgroundColor of label mask.
                    // please pass the backgroundColor of your TextInput container.
                    backgroundColor={'#F9F7F6'}
                    inputStyle={{ color: '#800000' }}
            />
        <AddButton/>
        

        <Button
            large
            title='SAVE'
            onPress={() => this.updateFirebase(uid, this.state, pictureuri, mime = 'image/jpg')} 
        />
        
      </View>
    )
  }
}

export default withNavigation(EditProfile);

const styles = StyleSheet.create({})