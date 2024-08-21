import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import dayjs from 'dayjs';
import { openDatabase, getAllLists, getAllItems } from '../database';

const HomeScreen = ({ navigation }) => {
  const [lists, setLists] = useState([]);
  const [items, setItems] = useState([]);
  const [db, setDb] = useState(null);
  const [today, setToday] = useState(dayjs().format('YYYY-MM-DD'));

  useEffect(() => {
    const initializeDb = async () => {
      const database = await openDatabase();
      setDb(database);
      updateLists(database);
      updateItems(database);
    };
    initializeDb();

    const checkDateChange = () => {
        const currentDay = dayjs().format('YYYY-MM-DD');
        if (currentDay !== today) {
            console.log(`Date changed from ${today} to ${currentDay}`);
            setToday(currentDay); 
        }
    };

    const interval = setInterval(checkDateChange, 60000); 
    
    return () => {
        clearInterval(interval);
        
    };
  }, [today]);

  useEffect(() => {
    if (db) {
      updateLists(db); 
    }
  }, [today, db]);

  useFocusEffect(
    useCallback(() => {
      if (db) {
        updateLists(db);
        updateItems(db);
      }
    }, [db])
  );

  const updateLists = async (database) => {
    const allRows = await getAllLists(database);
    const today = dayjs().format('YYYY-MM-DD');
    const todayList = dayjs().startOf('day').subtract(1, 'day').format();
    const todayRows = allRows.filter(row => row.date === today);

    const filteredAndSortedLists = allRows
        .filter(row => dayjs(row.date).isAfter(todayList)) 
        .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()); 

    todayRows.forEach(list => {
      scheduleNotificationForList(list);
    });

    setLists(filteredAndSortedLists);

  };

  const scheduleNotificationForList = async (list) => {
    const listDate = dayjs(list.date).format('YYYY-MM-DD');
    const today = dayjs().format('YYYY-MM-DD');

    if (listDate === today && list.notified === 0) {
        const notificationResult = await Notifications.scheduleNotificationAsync({
            content: {
                title: "Reminder",
                body: `Don't forget your tasks for today: ${list.title}`
            },
            trigger: { seconds:1 },
        });
        await db.runAsync('UPDATE lists SET notified = 1 WHERE id = ?', [list.id]);
    } else {
        console.log("Notification not scheduled due to condition not met or already notified.");
    }
  };



  const updateItems = async (database) => {
    const allRows = await getAllItems(database);
    setItems(allRows);
  };

  const ItemText = ({ text }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={styles.itemText}>{text}</Text>
    </View>
  );

  const renderTodayItem = (item) => {
    const itemTexts = items.filter(it => it.list_id === item.id).slice(0, 3).map(it => <ItemText key={it.id} text={it.text} />);
    return (
      <TouchableOpacity key={item.id} style={styles.cell} onPress={() => navigation.navigate('AddItem', { listId: item.id, title: item.title, date: item.date })}>
        <View style={styles.cellContent}>
          <Text style={styles.titleText}>{item.title}</Text>
            <View style={styles.itemContainer}>
              {itemTexts}
            </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAllItem = (item) => {
    const itemCount = items.filter(it => it.list_id === item.id).length;
    return (
      <TouchableOpacity key={item.id} onPress={() => navigation.navigate('AddItem', { listId: item.id, title: item.title, date: item.date })}>
        <View style={styles.allItemContainer}>
          <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <Text style={styles.subtitleText}>{item.title}</Text>
            <Text style={styles.dateText}>{dayjs(item.date).format('DD MMMM YYYY')}</Text>
          </View>  
          <Text style={styles.itemCountText}>{itemCount} items</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const todayDate = dayjs().format('YYYY-MM-DD');
  const todayLists = lists.filter(list => list.date === todayDate);
  const todayListsLength = lists.filter(list => list.date === todayDate).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.ScrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.header}>Today's Task</Text>
          <Text style={styles.subheader}>You have {todayListsLength} list today</Text>
          
        
          {todayLists.map(renderTodayItem)}

          <Text style={styles.sectionHeader}>Ongoing List</Text>
          {lists.map(renderAllItem)}

        </View>  
      </ScrollView>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddList')}
      >
        <Text style={styles.addButtonText}>ADD LIST</Text>
      </TouchableOpacity>
    </SafeAreaView>  
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    paddingBottom: 100, 
  },
  content: {
    paddingHorizontal: 10,
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 60,
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  subheader: {
    fontSize: 16,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  sectionHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  cell: {
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 10,
    backgroundColor: 'lightgrey',
    padding: 10,
  },
  itemContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: 5,
  },
  titleText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  itemText: {
    marginLeft: 20,
    marginBottom: 5,
    fontSize: 20,
  },
  allItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'lightgrey',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  subtitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  dateText: {
    fontSize: 14,
    color: 'black', 
    marginLeft: 15,
  },
  itemCountText: {
    fontSize: 16,
    color: 'black',
    marginRight: 15,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: Dimensions.get('window').width / 1.5, 
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    width: 150, 
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
