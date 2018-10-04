import React, {Component} from 'react';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { TabNavigator, TabBarBottom } from 'react-navigation'; // Version can be specified in package.json

import MapPage from '../views/MapPage';
import Dashboard from '../views/Dashboard';

const MapPageAndDashboardTab = TabNavigator(
            {
              MapPage: MapPage,
              Dashboard: Dashboard
              
            },
            {
              navigationOptions: ({ navigation }) => ({
                
                tabBarIcon: ({ focused, tintColor }) => {
                  const { routeName } = navigation.state;
                  let iconName;
                  if (routeName === 'MapPage') {
                    iconName = 'map';
                  } else if (routeName === 'Dashboard') {
                    iconName = 'speedometer';
                  } 

                    
          
                  // You can return any component that you like here! We usually use an
                  // icon component from react-native-vector-icons
                  return <Icon name={iconName} size={25} color={tintColor} />;
                },
              }),
              tabBarComponent: TabBarBottom,
              tabBarPosition: 'bottom',
              tabBarOptions: {
                activeTintColor: '#121fb5',
                inactiveTintColor: '#8dc999',
              },
              animationEnabled: false,
              swipeEnabled: false,
            }
          ); 
        
    
export default MapPageAndDashboardTab;