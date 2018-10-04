import { createStackNavigator } from 'react-navigation';
import EditProfile from '../views/EditProfile';
import MultipleAddButton from '../components/MultipleAddButton'
import MultiplePictureCamera from '../components/MultiplePictureCamera';



export const editProfileToCameraStack = createStackNavigator({

    EditProfile: EditProfile,
    PictureCamera: MultiplePictureCamera,
    MultipleAddButton: MultipleAddButton,

}, {
    initialRouteName: 'EditProfile'
}
)