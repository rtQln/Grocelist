import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { Icon } from 'react-native-elements';
import { openDatabase } from '../database';

const AddTodosScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [notified, setNotified] = useState(0);
  const [db, setDb] = useState(null);

  React.useEffect(() => {
    const initializeDb = async () => {
      const database = await openDatabase();
      setDb(database);
    };
    initializeDb();
  }, []);

  const submitForm = async () => {
    if (title === '' || !db) return;
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    await db.runAsync('INSERT INTO lists (title, date, notified) VALUES (?, ?, ?)', [title, formattedDate, notified]);
    setTitle('');
    setDate(new Date());
    setNotified(0);
    navigation.goBack();
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);
  };

  const showDatePicker = () => {
    setShow(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.close} onPress={() => navigation.goBack()}>
        <Icon name="close" type="AntDesign" size={64} color={"black"} />  
      </TouchableOpacity>
      <Text style={styles.header}>Crate New List</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Title"
        onChangeText={setTitle}
        value={title}
      />
      <TouchableOpacity
        onPress={showDatePicker}
        style={styles.datePickerButton}>
        <Text style={styles.datePickerText}>
          Select Date: {dayjs(date).format('DD-MM-YYYY')}
        </Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
      <TouchableOpacity style={styles.submitButton} onPress={submitForm}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  close: {
    position: 'absolute',
    top: Dimensions.get('window').width / 16,               
    right: Dimensions.get('window').width / 16,             
    padding: 10,           
  },
  header: {
    fontSize: 32,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    width: '80%' ,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  datePickerButton: {
    height: 40,
    width: '80%' ,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  datePickerText: {
    color: 'black',
    fontSize: 14,
  },
  submitButton: {
    height: 40,
    width: '80%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddTodosScreen;
