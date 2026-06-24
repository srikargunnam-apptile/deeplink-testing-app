import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/core/providers';
import { View, Text, StyleSheet } from 'react-native';

import HomeScreen from '../screens/Home';
import CollectionsScreen from '../screens/Collections';
import SearchScreen from '../screens/Search';
import CartScreen from '../screens/Cart';

import ProductScreen from '../screens/Product';
import CollectionScreen from '../screens/Collection';
import VariantSelectorScreen from '../screens/VariantSelector';
import OrdersScreen from '../screens/Orders';
import OrderDetailScreen from '../screens/OrderDetail';
import AccountLoginScreen from '../screens/AccountLogin';
import AccountRegisterScreen from '../screens/AccountRegister';
import ResetPasswordScreen from '../screens/ResetPassword';
import UpdateProfileScreen from '../screens/UpdateProfile';
import BlogsScreen from '../screens/Blogs';
import BlogScreen from '../screens/Blog';
import AccountScreen from '../screens/Account';
import SettingsScreen from '../screens/Settings';

function CartTabIcon({ color, size }) {
  const { itemCount } = useCart();
  return (
    <View>
      <Ionicons name="bag-handle-outline" color={color} size={size} />
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
        </View>
      )}
    </View>
  );
}

const TabNavigator = createBottomTabNavigator({
  screenOptions: ({ route }) => ({
    headerShown: false,
    tabBarIcon: ({ color, size }) => {
      switch (route.name) {
        case 'Home':
          return <Ionicons name="home-outline" color={color} size={size} />;
        case 'Collections':
          return <Ionicons name="grid-outline" color={color} size={size} />;
        case 'Search':
          return <Ionicons name="search-outline" color={color} size={size} />;
        case 'Cart':
          return <CartTabIcon color={color} size={size} />;
        default:
          return null;
      }
    },
  }),
  screens: {
    Home: { screen: HomeScreen, options: { title: 'Home' } },
    Collections: { screen: CollectionsScreen, options: { title: 'Shop' } },
    Search: { screen: SearchScreen, options: { title: 'Search' } },
    Cart: { screen: CartScreen, options: { title: 'Cart' } },
  },
});

const RootStack = createNativeStackNavigator({
  screens: {
    Tabs: { screen: TabNavigator, options: { headerShown: false } },
    Product: { screen: ProductScreen, options: { title: 'Product' } },
    Collection: { screen: CollectionScreen, options: { title: 'Collection' } },
    VariantSelector: {
      screen: VariantSelectorScreen,
      options: { title: 'Select Options', presentation: 'modal' },
    },
    Account: { screen: AccountScreen, options: { title: 'Account' } },
    AccountLogin: { screen: AccountLoginScreen, options: { title: 'Sign In' } },
    AccountRegister: { screen: AccountRegisterScreen, options: { title: 'Create Account' } },
    ResetPassword: { screen: ResetPasswordScreen, options: { title: 'Reset Password' } },
    UpdateProfile: { screen: UpdateProfileScreen, options: { title: 'Edit Profile' } },
    Orders: { screen: OrdersScreen, options: { title: 'Orders' } },
    OrderDetail: { screen: OrderDetailScreen, options: { title: 'Order Details' } },
    Blogs: { screen: BlogsScreen, options: { title: 'Blogs' } },
    Blog: { screen: BlogScreen, options: { title: 'Blog' } },
    Settings: { screen: SettingsScreen, options: { title: 'Settings' } },
  },
});

const _Navigation = createStaticNavigation(RootStack);
import { linking } from './linking';

export default function Navigation(props) {
  return <_Navigation {...props} linking={linking} />;
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#DC2626',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
