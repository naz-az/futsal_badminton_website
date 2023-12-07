import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider } from './context/authContext';

// Import screens
import HomeScreen from './screens/HomeScreen';
import ProjectScreen from './screens/ProjectScreen';
import LoginForm from './screens/LoginForm';
import RegistrationForm from './screens/RegisterForm';
import Header from './components/Header';
import SettingsPage from './screens/SettingsPage';

import BlockedUsersPage from './screens/BlockedUsersPage';
import Categories from './screens/Categories';
import ChangePasswordForm from './screens/ChangePasswordForm';
import FollowedTagsPage from './screens/FollowedTagsPage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FavouritesScreen from './screens/FavouritesScreen';
import FollowersPage from './screens/FollowersPage';
import FollowingPage from './screens/FollowingPage';
import ProfileScreen from './screens/ProfileScreen';
import Send from './screens/Send';
import UserAccount from './screens/UserAccount';
import UserProfileDetail from './screens/UserProfileDetail';
import NotificationSettings from './screens/NotificationSettings';
import ThreadMessages from './screens/ThreadMessages';
import Thread from './screens/Thread';
import NotificationsPage from './screens/NotificationsPage';
import AddProject from './screens/AddProject';
import EditProject from './screens/EditProject';
import EditAccount from './screens/EditAccount';
// import SwipePage from './screens/SwipePage';

import { createDrawerNavigator } from '@react-navigation/drawer';

import OtherUserFollowersPage from './screens/OtherUserFollowersPage';
import OtherUserFollowingPage from './screens/OtherUserFollowingPage';

import SwipePage from './ReactNative-Swipe-Function/src/Main/SwipePage';
import AttendingProjects from './screens/AttendingProjects';

// const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
// const HomeStack = createStackNavigator();

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const HomeStack = createStackNavigator();

// Home stack navigator (nested within the Home tab)
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator initialRouteName="Home">
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}  />
      <HomeStack.Screen name="ProjectScreen" component={ProjectScreen} options={{ headerShown: false }}  />
      <HomeStack.Screen name="BlockedUsersPage" component={BlockedUsersPage} />
      <HomeStack.Screen name="Categories" component={Categories} />
      <HomeStack.Screen name="FavouritesScreen" component={FavouritesScreen} />
      <HomeStack.Screen name="FollowersPage" component={FollowersPage} />
      <HomeStack.Screen name="FollowingPage" component={FollowingPage} />
      <HomeStack.Screen name="ChangePasswordForm" component={ChangePasswordForm} />
      <HomeStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <HomeStack.Screen name="FollowedTagsPage" component={FollowedTagsPage} />

      <HomeStack.Screen name="Send" component={Send} />
      <HomeStack.Screen name="UserAccount" component={UserAccount} />
      <HomeStack.Screen name="UserProfileDetail" component={UserProfileDetail} />
      <HomeStack.Screen name="NotificationSettings" component={NotificationSettings} />
      <HomeStack.Screen name="ThreadMessages" component={ThreadMessages} />
      <HomeStack.Screen name="Thread" component={Thread} />
      <HomeStack.Screen name="Notifications" component={NotificationsPage} />
      <HomeStack.Screen name="AddProject" component={AddProject} />
      <HomeStack.Screen name="EditProject" component={EditProject} />
      <HomeStack.Screen name="EditAccount" component={EditAccount} />
      <HomeStack.Screen name="SwipePage" component={SwipePage} />
      <HomeStack.Screen name="SettingsPage" component={SettingsPage} />

      <HomeStack.Screen name="OtherUserFollowersPage" component={OtherUserFollowersPage} />
      <HomeStack.Screen name="OtherUserFollowingPage" component={OtherUserFollowingPage} />

      <HomeStack.Screen name="AttendingProjects" component={AttendingProjects} />


    </HomeStack.Navigator>
  );
}

// Bottom tab navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ), headerShown: false
        }}
        
      />

<Tab.Screen 
        name="ProfileScreen" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" color={color} size={size} />
          ), headerShown: false
        }}
      />

<Tab.Screen 
        name="Inbox" 
        component={ThreadMessages}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="email" color={color} size={size} />
          ),headerShown: false
        }}
      />


      <Tab.Screen 
        name="Favourites" 
        component={FavouritesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="favorite" color={color} size={size} />
          ),headerShown: false
        }}
      />


    <Tab.Screen 
        name="UserAccount" 
        component={UserAccount}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account_circle" color={color} size={size} />
          ),headerShown: false
        }}
      />

<Tab.Screen 
        name="Notification" 
        component={NotificationsPage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="category" color={color} size={size} />
          ),headerShown: false
        }}
      />

<Tab.Screen 
        name="SwipePage" 
        component={SwipePage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person_add" color={color} size={size} />
          ),headerShown: false
        }}
      />

{/* <Tab.Screen 
        name="Following" 
        component={FollowingPage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="user-following" color={color} size={size} />
          ),
        }}
      />
<Tab.Screen 
        name="Settings" 
        component={SettingsPage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings" color={color} size={size} />
          ),
        }}
      /> */}

      {/* Add other tabs here as needed */}
    </Tab.Navigator>
  );
}


// Drawer navigator
function MainDrawerNavigator() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Tabs" component={MainTabNavigator} />

      <Drawer.Screen name="Home" component={HomeStackNavigator} />
      <Drawer.Screen name="ProfileScreen" component={ProfileScreen} />
      <Drawer.Screen name="Inbox" component={ThreadMessages} />
      <Drawer.Screen name="Favourites" component={FavouritesScreen} />
      <Drawer.Screen name="UserAccount" component={UserAccount} />
      <Drawer.Screen name="Notification" component={NotificationsPage} />
      <Drawer.Screen name="SwipePage" component={SwipePage} />

      <Drawer.Screen name="AddProject" component={AddProject} />
      <Drawer.Screen name="SettingsPage" component={SettingsPage} />
      <Drawer.Screen name="Categories" component={Categories} />
      <Drawer.Screen name="FollowersPage" component={FollowersPage} />
      <Drawer.Screen name="FollowingPage" component={FollowingPage} />

      <Drawer.Screen name="AttendingProjects" component={AttendingProjects} />


      {/* Add other drawer items here as needed */}
    </Drawer.Navigator>
  );
}


// Main App component
const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            header: ({ navigation, route, options }) => <Header navigation={navigation} />
          }}
        >
          {/* Screens accessible before logging in */}
          <Stack.Screen name="Login" component={LoginForm} />
          <Stack.Screen name="Register" component={RegistrationForm} /> 
          
          {/* Main application screens, only accessible after login
          {/* <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} /> */}
          <Stack.Screen name="Main" component={MainDrawerNavigator} options={{ headerShown: false }} /> 

        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
