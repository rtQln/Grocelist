import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';


const SettingScreen = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [defaultView, setDefaultView] = useState('Home');

  const toggleTheme = () => {
    const newTheme = !isDarkTheme ? 'dark' : 'light';
    setIsDarkTheme(!isDarkTheme);
  };

  const toggleNotifications = () => {
    const newNotificationsEnabled = !notificationsEnabled;
    setNotificationsEnabled(newNotificationsEnabled);
  };

  const changeDefaultView = (view) => {
    setDefaultView(view);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <View style={styles.setting}>
        <Text style={styles.settingText}>Dark Theme</Text>
        <Switch
          value={isDarkTheme}
          onValueChange={toggleTheme}
        />
      </View>
      <View style={styles.setting}>
        <Text style={styles.settingText}>Enable Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </View>
      <View style={styles.setting}>
        <Text style={styles.settingText}>Default View</Text>
        <View style={styles.defaultViewContainer}>
          <TouchableOpacity 
            style={[styles.viewButton, defaultView === 'Home' && styles.selectedViewButton]}
            onPress={() => changeDefaultView('Home')}
          >
            <Text style={styles.viewButtonText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.viewButton, defaultView === 'Calendar' && styles.selectedViewButton]}
            onPress={() => changeDefaultView('Calendar')}
          >
            <Text style={styles.viewButtonText}>Calendar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  settingText: {
    fontSize: 18,
  },
  defaultViewContainer: {
    flexDirection: 'row',
  },
  viewButton: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginLeft: 10,
  },
  selectedViewButton: {
    backgroundColor: '#4285F4',
  },
  viewButtonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default SettingScreen;
