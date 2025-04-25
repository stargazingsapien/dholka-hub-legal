import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  GestureResponderEvent,
  ScrollView,
  Linking,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useUser} from '../../../utils/UserContext';
import {Modal, Pressable} from 'react-native';
import {getAuth, signOut} from 'firebase/auth';
import {doc, getDoc} from 'firebase/firestore';
import {db} from '../../constants/firsebaseConfig';

interface OptionProps {
  icon: string;
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
}

const Option: React.FC<OptionProps> = ({icon, label, onPress}) => (
  <TouchableOpacity style={styles.option} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.optionLeft}>
      <Icon name={icon} size={22} color="#fff" />
      <Text style={styles.optionText}>{label}</Text>
    </View>
    <Icon name="chevron-right" size={24} color="#bbb" />
  </TouchableOpacity>
);

const handleOrderFood = () => {
  // Open Zomato Dholka in a web browser
  Linking.openURL('https://www.zomato.com/dholka'); // Replace with actual URL for Zomato Dholka
};

const handleBookMovieTickets = () => {
  // Open Paytm Dholka movie ticket booking in a web browser
  Linking.openURL('https://paytm.com/movies/dholka'); // Replace with actual URL for Paytm Dholka Movie Tickets
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const {user, setUser} = useUser();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const currentUser = getAuth().currentUser;
        if (!currentUser) {
          console.log('No user logged in');
          setLoading(false);
          return;
        }

        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userDataFromFirestore = docSnap.data();
          setUserData(userDataFromFirestore);
          if (userDataFromFirestore?.image) {
            setUser(prev => ({...prev, image: userDataFromFirestore.image}));
          }
        } else {
          console.log('User document does not exist');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [setUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  console.log(userData);

  if (loading || !userData) {
    return (
      <View style={styles.container}>
        <Text style={{color: '#fff', textAlign: 'center', marginTop: 20}}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {user?.image ? (
          <Image source={{uri: user.image}} style={styles.profileImage} />
        ) : (
          <Text style={styles.noImage}>No profile image</Text>
        )}
        <Text style={styles.name}>{userData?.username}</Text>
        <Text style={styles.email}>{userData?.email}</Text>
        <Text style={styles.phone}>{userData?.contact}</Text>

        <View style={styles.optionContainer}>
          <Option
            icon="account-edit"
            label="Edit Profile"
            onPress={() => navigation.navigate('EditUserProfile')}
          />
          <Option
            icon="bell-outline"
            label="Notifications"
            onPress={() => navigation.navigate('Notifications')}
          />
          <Option
            icon="lock"
            label="Privacy Policy"
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <Option
            icon="gavel"
            label="Terms and Conditions"
            onPress={() => navigation.navigate('TermsConditions')}
          />
          <Option
            icon="heart-outline"
            label="Favorites"
            onPress={() => navigation.navigate('Favorites')}
          />
          <Option
            icon="food-fork-drink"
            label="Order food Online"
            onPress={handleOrderFood}
          />
          <Option
            icon="ticket-confirmation"
            label="Book Movie Tickets"
            onPress={handleBookMovieTickets}
          />
        </View>

        <Modal
          transparent={true}
          visible={languageModalVisible}
          animationType="fade"
          onRequestClose={() => setLanguageModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choose Language</Text>

              {['English', 'Hindi', 'Gujarati'].map(lang => (
                <Pressable
                  key={lang}
                  style={({pressed}) => [
                    styles.langOption,
                    pressed && {backgroundColor: '#333'},
                    selectedLanguage === lang && {backgroundColor: '#FF4757'},
                  ]}
                  onPress={() => {
                    setSelectedLanguage(lang);
                    setLanguageModalVisible(false);
                  }}>
                  <Text style={styles.langText}>{lang}</Text>
                </Pressable>
              ))}

              <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.8}
        onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 999,
    alignSelf: 'center',
    marginTop: 60,
  },
  name: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 7,
  },
  email: {
    color: '#FF4757',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginBottom: 9,
  },
  phone: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionContainer: {
    marginTop: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 15,
    marginVertical: 6,
    borderRadius: 10,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
  },
  logoutButton: {
    backgroundColor: '#FF4757',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  logoutText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  noImage: {
    color: '#ccc',
    marginBottom: 16,
    alignSelf: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    padding: 25,
    borderRadius: 15,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  langOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 6,
    backgroundColor: '#2c2c2c',
    width: '100%',
    alignItems: 'center',
  },
  langText: {
    color: '#fff',
    fontSize: 16,
  },
  modalCancel: {
    color: '#FF4757',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
