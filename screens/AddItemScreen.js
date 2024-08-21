import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import { Icon } from 'react-native-elements';
import { openDatabase, getAllItemsForList, deleteItem, updateItemDone } from '../database';

const AddItemScreen = ({ route, navigation }) => {
  const { listId, title, date } = route.params;
  const [text, setText] = useState('');
  const [db, setDb] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const initializeDb = async () => {
      const database = await openDatabase();
      setDb(database);
      updateItemsList(database);
    };
    initializeDb();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (db) {
        updateItemsList(db);
      }
    }, [db])
  );

  const submitItem = async () => {
    if (text === '' || !db) return;
    await db.runAsync('INSERT INTO items (list_id, text, done) VALUES (?, ?, ?)', [listId, text, 0]);
    setText('');
    updateItemsList(db);
  };

  const updateItemsList = async (database) => {
    const allRows = await getAllItemsForList(database, listId);
    setItems(allRows);
  };

  const deleteItemById = async (id) => {
    await deleteItem(db, id);
    updateItemsList(db);
  };

  const handleDeleteItem = (id) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => deleteItemById(id) },
      ],
      { cancelable: true }
    );
  };

  const toggleItemDone = async (id, done) => {
    await updateItemDone(db, id, done ? 1 : 0);
    updateItemsList(db);
  };

  const renderItem = ({ item }) => (
    
    <TouchableOpacity style={styles.itemContainer} onPress={() => toggleItemDone(item.id, item.done !== 1)}>
      <View style={[styles.item , item.done === 1 && styles.itemDone]}> 
      <Text style={[styles.itemText, item.done === 1 && styles.itemTextDone]}>{item.text}</Text>
        <Icon
            name="delete"
            size={24}
            color="red"
            onPress={() => handleDeleteItem(item.id)}
        />
      </View>   
    </TouchableOpacity>  
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.close} onPress={() => navigation.goBack()}>
        <Icon name="close" type="antdesign" size={32} color={"black"} />  
      </TouchableOpacity>
      
      <Text style={styles.header}>{title}</Text>
      <Text style={styles.subHeader}>Listed for {dayjs(date).format('DD MMMM YYYY')}</Text>
      <TextInput
        style={styles.input}
        placeholder="Add New Item"
        onChangeText={setText}
        value={text}
      />
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />
      <TouchableOpacity style={styles.submitButton} onPress={submitItem}>
        <Text style={styles.submitButtonText}>ADD</Text>
      </TouchableOpacity>
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 50,
    paddingTop: 50,
    paddingBottom: 20,
  },
  close: {
    position: 'absolute',
    top: Dimensions.get('window').width / 16,               
    right: Dimensions.get('window').width / 16,             
    padding: 10,           
  },
  header: {
    marginTop: Dimensions.get('window').width / 6, 
    fontSize: 40,
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    height: 60,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 50,
    padding: 10,
    width: '100%',
  },
  submitButton: {
    backgroundColor: 'black',
    padding: 10,
    width: '100%',
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  item: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 25,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 20,
  },
  itemDone: {
    backgroundColor: 'darkgreen',
    borderColor: 'darkgreen',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 18,
    flex: 1,
  },
  itemTextDone: {
    color: 'white',
    textDecorationLine: 'line-through',
    fontWeight: 'bold'
  },
});

export default AddItemScreen;
