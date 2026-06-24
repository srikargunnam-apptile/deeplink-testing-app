import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/Home';
import SettingsScreen from '../screens/Settings';

// Bottom tabs: Home screen
const TabNavigator = createBottomTabNavigator({
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        title: 'Home',
        headerShown: false,
      },
    },
  },
});

// Root stack: tabs + settings as stack screen
const RootStack = createNativeStackNavigator({
  screens: {
    Tabs: {
      screen: TabNavigator,
      options: {
        headerShown: false,
      },
    },
    Settings: {
      screen: SettingsScreen,
      options: {
        title: 'Settings',
        headerShown: true,
        presentation: 'card',
      },
    },
  },
});

const _Navigation = createStaticNavigation(RootStack);
import { linking } from './linking';

export default function Navigation(props) {
  return <_Navigation {...props} linking={linking} />;
}
