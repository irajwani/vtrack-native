import React, { Component } from 'react'
import { Text, StyleSheet, View } from 'react-native';
import {withNavigation, StackNavigator} from 'react-navigation'; // Version can be specified in package.json
import {ButtonGroup, Button} from 'react-native-elements';
import { Sae, Fumi } from 'react-native-textinput-effects';
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

  updateFirebase(uid, data, mime = 'image/jpg') {
    var updates = {};
    

    updates['/Drivers/' + uid + '/profile/'] = data;

    return {database: firebase.database().ref().update(updates), 
            storage: new Promise((resolve, reject) => {
                        const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
                        let uploadBlob = null
                        const imageRef = firebase.storage().ref().child(`Users/${uid}`);
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
    const uid = firebase.auth().currentUser.uid;
    return (
      <View>
        <Sae
            label={'FirstName LastName'}
            value={this.state.name}
            onChangeText={name => this.setState({ name })}
            autoCorrect={false}
            inputStyle={{ color: '#0a3f93' }}
        />

        

        <Button
            large
            title='SAVE'
            onPress={() => this.updateFirebase(uid, this.state.name, pictureuri, mime = 'image/jpg')} 
        />
        
      </View>
    )
  }
}

export default withNavigation(EditProfile);

const styles = StyleSheet.create({})