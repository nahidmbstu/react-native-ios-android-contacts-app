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
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import Contacts from 'react-native-contacts';

import Icon from 'react-native-vector-icons/FontAwesome';

const TextColor = '#111';

const ContactView = ({item}) => {
  const onCall = ({phoneNumbers}) => {
    Linking.openURL(`tel:${phoneNumbers[0].number}`);
  };
  const onSmS = ({phoneNumbers}) => {
    Linking.openURL(`sms:${phoneNumbers[0].number}`);
  };

  return (
    <View style={styles.contactStyle}>
      <Text style={{color: TextColor}}>{item.givenName}</Text>
      <View style={styles.rightSide}>
        <Icon
          name="phone"
          size={30}
          color={'green'}
          onPress={() => onCall(item)}
        />
        <Icon
          name="comment"
          size={30}
          color="green"
          onPress={() => onSmS(item)}
        />
      </View>
    </View>
  );
};
const Header = () => (
  <View style={styles.headerStyle}>
    <Text style={{color: TextColor, fontSize: 20}}>Contacts</Text>
  </View>
);

const App = () => {
  const [contacts, setContacts] = React.useState([]);
  const isDarkMode = useColorScheme() === 'dark';

  React.useEffect(() => {
    getContacts();
  }, []);

  const getContacts = () => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
        title: 'Contacts',
        message: 'This app would like to view your contacts.',
        buttonPositive: 'Please accept bare mortal',
      }).then(res => {
        console.log(res);

        if (res === 'granted') {
          Contacts.getAll().then(numbers => {
            console.log(numbers);
            setContacts(numbers);
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
            setContacts(numbers);
          });
        }
        if (permission === 'denied') {
          console.log('noop');
        }
      });
    }
  };

  return (
    <SafeAreaView style={styles.back}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.back}>
        <Header />
        <FlatList
          data={contacts}
          renderItem={({item}) => <ContactView item={item} />}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  back: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerStyle: {
    height: 65,
    width: '100%',
    justifyContent: 'center',
    padding: 10,
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
    width: 100,
  },
});

export default App;
