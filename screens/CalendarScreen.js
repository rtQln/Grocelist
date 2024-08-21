import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SafeAreaView, StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView, Dimensions
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { Icon } from 'react-native-elements';
import { useFocusEffect } from '@react-navigation/native';
import { openDatabase, getListsByDate, getItemsForList } from '../database';

const CalendarScreen = ({ navigation }) => {
  const [date, setDate] = useState(dayjs()); 
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dates, setDates] = useState([]);
  const [lists, setLists] = useState([]);
  const scrollViewRef = useRef(null);

  const generateDateRange = (baseDate, range) => {
    let dates = [];
    for (let i = -range; i <= range; i++) {
      dates.push(dayjs(baseDate).add(i, 'day').format('YYYY-MM-DD'));
    }
    return dates;
  };

  useEffect(() => {
    setDates(generateDateRange(date, 30)); 
  }, [date]);

  
  const fetchLists = useCallback(async () => {
    const db = await openDatabase();
    const listsForDate = await getListsByDate(db, date.format('YYYY-MM-DD'));
    const listsWithItems = await Promise.all(
      listsForDate.map(async list => {
        const items = await getItemsForList(db, list.id);
        return { ...list, items };
      })
    );
    setLists(listsWithItems);
  });

  useFocusEffect( 
    useCallback(() => {
      fetchLists();
    }, [date])
  );

  useEffect(() => {
    const index = dates.indexOf(date.format('YYYY-MM-DD'));
    const offset = 1.25 * (60 + 10);
    if (index === -1 || index < 3 || index > dates.length - 4) {
      const newDates = generateDateRange(date, 15);
      setDates(newDates);

      const newIndex = newDates.indexOf(date.format('YYYY-MM-DD'));
      const position = newIndex * (60 + 10) - offset;
      scrollViewRef.current.scrollTo({ x: position, animated: true });
    } else {
      const position = index * (60 + 10) - offset;
      scrollViewRef.current.scrollTo({ x: position, animated: true });
    }
  }, [date, dates]);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate ? dayjs(selectedDate) : date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const ItemText = ({ text }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={styles.itemText}>{text}</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const itemTexts = item.items.slice(0, 3).map(it => <ItemText key={it.id} text={it.text} />);
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('AddItem', { listId: item.id, title: item.title, date: item.date })}
        style={styles.cell}
      >
        <View style={styles.cellContent}>
          <Text style={styles.titleText}>{item.title}</Text>
          <View style={styles.itemContainer}>
            {itemTexts}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Schedule</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.calendarButton}
        >
          <Icon
                name="calendar"
                type="font-awesome"
                size={24}
                color="black"
          />
        </TouchableOpacity>
      </View>
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date.toDate()}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
      <View>
        <ScrollView
          ref={scrollViewRef}
          horizontal={true}
          contentContainerStyle={{
            height: 100,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          style={styles.dateScroll}
          showsHorizontalScrollIndicator={false}
        >
          {dates.map((dateStr, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateButton,
                date.format('YYYY-MM-DD') === dateStr ? styles.selectedDate : null
              ]}
              onPress={() => setDate(dayjs(dateStr))}
            >
              <Text style={styles.dateText}>{dayjs(dateStr).format('DD')}</Text>
              <Text style={styles.dateText}>{dayjs(dateStr).format('MMM')}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.listText}>List for {date.format('DD MMMM YYYY')}</Text>
        <FlatList
          data={lists}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
        />
      </View>
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
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  calendarButton: {
    padding: 10,
    backgroundColor: 'transparent',
  },
  dateScroll: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 5,
    marginBottom: 20,
    height: 100,
  },
  dateButton: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    height: 80,
  },
  selectedDate: {
    backgroundColor: 'grey',
  },
  dateText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  cell: {
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 20,
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
    marginLeft: 15
  },
  itemText: {
    marginLeft: 20,
    marginBottom: 5,
    fontSize: 20,
  },
  listText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 5,
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

export default CalendarScreen;
