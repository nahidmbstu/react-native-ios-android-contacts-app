/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  PermissionsAndroid,
  FlatList,
  Platform,
  Linking,
  TouchableOpacity,
  Modal,
  Alert,
  Share,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import Contacts from 'react-native-contacts';
import {NavigationContainer} from '@react-navigation/native';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Icon from 'react-native-vector-icons/FontAwesome';

import IonIcon from 'react-native-vector-icons/Ionicons';
import {Button, Card, TextInput} from 'react-native-paper';

const TextColor = '#111';

const onCall = ({phoneNumbers}) => {
  Linking.openURL(`tel:${phoneNumbers[0].number}`);
};
const onSmS = ({phoneNumbers}) => {
  Linking.openURL(`sms:${phoneNumbers[0].number}`);
};

const onShare = async item => {
  try {
    const result = await Share.share({
      message: `${item.phoneNumbers[0].number}`,
    });
    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // shared with activity type of result.activityType
      } else {
        // shared
      }
    } else if (result.action === Share.dismissedAction) {
      // dismissed
    }
  } catch (error) {
    alert(error.message);
  }
};

const ContactView = ({item, navigation}) => {
  return (
    <View style={styles.contactStyle}>
      <Text style={{color: TextColor, fontSize: 16}}>{item.givenName}</Text>
      <View style={styles.rightSide}>
        <IonIcon name="arrow-forward" size={25} color="#67aaf9" />
      </View>
    </View>
  );
};
const Header = ({showSearch, addvisible, navigation}) => {
  const search = () => {
    showSearch();
  };
  const add = () => {
    addvisible();
  };
  return (
    <View style={styles.headerStyle}>
      <Text style={{color: TextColor, fontSize: 20}}>Contacts</Text>
      <View style={styles.headerRight}>
        <TouchableOpacity onPress={search} style={styles.headerBtn}>
          <Icon name="search" size={30} color="#67aaf9" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddContact')}
          style={styles.headerBtn}>
          <IonIcon name="person-add" size={30} color="#67aaf9" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SearchBox = props => (
  <View style={{padding: 10}}>
    <TextInput
      underlineColorAndroid={'tomato'}
      {...props}
      label="search .."
      autoFocus={true}
    />
  </View>
);

const ContactDetail = ({route}) => {
  return (
    <View style={{padding: 10}}>
      <Card style={{padding: 10}}>
        <Text style={{fontSize: 20, paddingVertical: 10}}>
          {route.params.item.givenName}
        </Text>
        <Text style={{fontSize: 20, paddingVertical: 10}}>
          {route.params.item.phoneNumbers[0].number}
        </Text>
        <View style={styles.detailsAction}>
          <Icon
            name="phone"
            size={30}
            color={'#67aaf9'}
            onPress={() => onCall(route.params.item)}
          />
          <Icon
            name="comment"
            size={30}
            color="#67aaf9"
            onPress={() => onSmS(route.params.item)}
          />
          <Icon
            name="share"
            size={30}
            color="#67aaf9"
            onPress={() => onShare(route.params.item)}
          />
        </View>
      </Card>
    </View>
  );
};

const ContactAdd = () => {
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');

  const onSave = () => {
    if (name && phone) {
      var newPerson = {
        phoneNumbers: [
          {
            label: name,
            number: phone,
          },
        ],
        givenName: name,
      };
      Contacts.openContactForm(newPerson).then(contact => {
        // contact has been saved
        console.log(contact);
        if (contact.givenName === name) {
          Alert.alert('contact saved successfully');
        }
      });
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.addForm}>
        <TextInput
          label="name"
          value={name}
          autoFocus={true}
          onChangeText={text => setName(text)}
          style={{marginBottom: 10}}
        />
        <TextInput
          label="phone-number"
          keyboardType="numeric"
          value={phone}
          onChangeText={text => setPhone(text)}
        />
        <Button style={{marginVertical: 20}} mode="contained" onPress={onSave}>
          Save Contact
        </Button>
      </View>
    </SafeAreaView>
  );
};

const Home = ({navigation}) => {
  const [contacts, setContacts] = React.useState([]);
  const [searchBox, setSearchBox] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [renderedContacts, setRenderContacts] = React.useState([]);
  const [addContact, setContactAdd] = React.useState(false);

  const isDarkMode = useColorScheme() === 'dark';

  React.useEffect(() => {
    getContacts();
    const unsubscribe = navigation.addListener('focus', () => {
      getContacts();
    });
    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  const getContacts = () => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
        title: 'Contacts',
        message: 'This app would like to view your contacts.',
        buttonPositive: 'Please accept ',
      }).then(res => {
        console.log(res);

        if (res === 'granted') {
          Contacts.getAll().then(numbers => {
            console.log(numbers);
            let sort = numbers.sort(function (a, b) {
              if (a.givenName < b.givenName) return -1;
              if (b.givenName < a.givenName) return 1;
              return 0;
            });
            setContacts(sort);
            setRenderContacts(sort);
          });
        }
      });
    }

    if (Platform.OS === 'ios') {
      console.log('ios');

      Contacts.checkPermission().then(permission => {
        // Contacts.PERMISSION_AUTHORIZED || Contacts.PERMISSION_UNDEFINED || Contacts.PERMISSION_DENIED

        console.log(permission);

        if (permission === 'undefined') {
          Contacts.requestPermission().then(per => {
            console.log(per);
          });
        }

        if (permission === 'authorized') {
          console.log('yay');
          Contacts.getAll().then(numbers => {
            console.log(numbers);
            let sort = numbers.sort(function (a, b) {
              if (a.givenName < b.givenName) return -1;
              if (b.givenName < a.givenName) return 1;
              return 0;
            });
            setContacts(sort);
            setRenderContacts(sort);
          });
        }
        if (permission === 'denied') {
          console.log('noop');
        }
      });
    }
  };

  const showSearch = () => {
    setSearchBox(!searchBox);
  };

  const onChangeSearch = query => {
    setSearchQuery(query);

    let text = query.toLowerCase();
    let fullList = contacts;
    let filteredList = fullList.filter(item => {
      // search from a full list, and not from a previous search results list
      if (item.givenName.toLowerCase().match(text)) return item;
    });
    if (!text || text === '') {
      setRenderContacts(fullList);
    } else if (!filteredList.length) {
      setContacts(fullList);
    } else if (Array.isArray(filteredList)) {
      setRenderContacts(filteredList);
    }
  };

  const addvisible = () => {
    setContactAdd(!addContact);
  };

  return (
    <SafeAreaView style={styles.back}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.back}>
        <Header
          showSearch={showSearch}
          addvisible={addvisible}
          navigation={navigation}
        />
        {searchBox ? (
          <SearchBox onChangeText={onChangeSearch} value={searchQuery} />
        ) : null}
        {addContact ? (
          <ContactAdd visible={addContact} addvisible={addvisible} />
        ) : null}
        <FlatList
          data={renderedContacts}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Details', {item})}>
              <ContactView item={item} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <Text style={{textAlign: 'center'}}>No Contacts Found</Text>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const Stack = createNativeStackNavigator();

const NavMain = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Home"
      component={Home}
      options={{
        header: () => null,
      }}
    />
    <Stack.Screen name="Details" component={ContactDetail} />
    <Stack.Screen name="AddContact" component={ContactAdd} />
  </Stack.Navigator>
);

const App = () => (
  <NavigationContainer>
    <NavMain />
  </NavigationContainer>
);

const styles = StyleSheet.create({
  back: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerStyle: {
    flexDirection: 'row',
    height: 65,
    width: '100%',
    padding: 10,
    justifyContent: 'space-between',
    elevation: 3,
    shadowOffset: {width: 0, height: 2},
    shadowColor: '#000',
    shadowOpacity: 0.2,
  },
  contactStyle: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
  },
  rightSide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // width: 100,
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerBtn: {
    marginHorizontal: 10,
  },
  addForm: {
    padding: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A4E29C',
    padding: 10,
  },
  detailsAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
});

export default App;
