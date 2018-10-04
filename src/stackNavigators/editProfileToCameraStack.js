import { createStackNavigator } from 'react-navigation';
import EditProfile from '../views/EditProfile';
import MultipleAddButton from '../components/MultipleAddButton'
import MultiplePictureCamera from '../components/MultiplePictureCamera';



export const EditProfileToCameraStack = createStackNavigator({

    EditProfile: EditProfile,
    MultiplePictureCamera: MultiplePictureCamera,
    MultipleAddButton: MultipleAddButton,

}, {
    initialRouteName: 'EditProfile'
}
)