import React, { Component } from 'react'
import { Text, StyleSheet, View } from 'react-native'
import {withNavigation} from 'react-navigation'

export default class Dashboard extends Component {
  render() {
    return (
      <View>
        <Text> textInComponent </Text>
      </View>
    )
  }
}

export default withNavigation(Dashboard);

const styles = StyleSheet.create({})