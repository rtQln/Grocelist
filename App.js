import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';
import HomeScreen from './screens/HomeScreen';
import AddItemScreen from './screens/AddItemScreen';
import AddListScreen from './screens/AddListScreen';
import CalendarScreen from './screens/CalendarScreen';
import SettingsScreen from './screens/SettingsScreen';
import * as Notifications from 'expo-notifications';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowSound: true,
      allowBadge: true,
    },
  });
  if (status === 'granted') {
    console.log('Notification permissions granted.');
  } else {
    console.log('Notification permissions denied.');
  }
}

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }}/>
    <Stack.Screen name="AddItem" component={AddItemScreen} options={{ headerShown: false }}/>
    <Stack.Screen name="AddList" component={AddListScreen} options={{ headerShown: false }}/>
  </Stack.Navigator>
);

const CalendarStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="CalendarMain" component={CalendarScreen} options={{ headerShown: false }}/>
    <Stack.Screen name="AddItem" component={AddItemScreen} options={{ headerShown: false }}/>
    <Stack.Screen name="AddList" component={AddListScreen} options={{ headerShown: false }}/>
  </Stack.Navigator>
);

const App = () => {
  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: 'black',
          tabBarInactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeStack} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="home" type="font-awesome" size={size + 12} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Calendar" 
          component={CalendarStack} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="calendar" type="font-awesome" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Setting" 
          component={SettingsScreen} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="cog" type="font-awesome" size={size + 8} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
