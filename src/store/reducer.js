import firebase from '../cloud/firebase'

const initialState = {
    
    showSignIn: false,
    loading: false,
    loggedIn: false,
    editProfile: false,

}

//Taking the state and modifying it with some sort of action
const reducer = (state = initialState, action) => {
    const newState = {...state};

    switch(action.type) {
        case 'onSignInPress' :

            newState.loading = true;
            //hopefully this forcibly renders pacman:
            
            firebase.auth().signInWithEmailAndPassword(action.email, action.pass);
            
            newState.loading = false;
            newState.loggedIn = true;
            
            //newState.uid = firebase.auth().currentUser.uid
            // var {uid} = newState;
            // promiseToGetData(uid, newState)
            // .then( (fromResolve) => { newState.data = fromResolve; newState.paths = getPaths(fromResolve); console.log(newState)  })
            break;
        case 'onSignUpPress':
            newState.loading = true;
            //create a new user
            firebase.auth().createUserWithEmailAndPassword(action.email, action.pass);
            //make a new database branch for user
            // var uid = firebase.auth().currentUser.uid;
            // var updates = {};
            // var postData = { name: '', car: '', country: '', uri: ''};
            // updates['/Drivers/' + uid + '/profile/'] = postData;
            // firebase.database().ref().update(updates);
            newState.editProfile = true; 

        case 'showSignIn':

            newState.showSignIn = true;
            break;
            
        // firebase.auth().signInWithEmailAndPassword(action.email, action.pass)
            //     .then( () => {
                    
            //         var bool = false;
            //         firebase.auth().onAuthStateChanged(
            //             (user) => {
            //                 if(user) { newState.loggedIn = true; newState.loading = false; return newState} 
            //                 else {console.log('no user found')}
            //             }
            //         )
                    
            //     })
            // return newState;
        
        
    }

    return newState;
    
}

export default reducer;