import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Spacing from '../constants/Spacing';
import FontSize from '../constants/FontSize';
import Colors from '../constants/Colors';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';



const CreateFlat = ({ navigation }) => {
  const [flatName, setFlatName] = useState('');
  const [loading, setLoading] = useState(false);

  
  
  
  const generateFlatNumber = async () => {
    const firestore = getFirestore();
    let isUnique = false;
    let flatNum;

    while (!isUnique) {
      flatNum = Math.floor(100000 + Math.random() * 900000).toString();
      const flatsQuery = query(collection(firestore, 'flats'), where('flatNum', '==', flatNum));
      const querySnapshot = await getDocs(flatsQuery);

      if (querySnapshot.empty) {
        isUnique = true;
      }
    }
    return flatNum
}



const handleCreateFlat = async () => {
    if (!flatName) {
      alert('Error', 'Please enter a flat name');
      return;
    }

    setLoading(true);
    const auth = getAuth();
    const firestore = getFirestore();
    const user = auth.currentUser;

    if (user) {
      try {
        const flatNum = await generateFlatNumber();
        console.log(flatNum)
        const flatRef = await addDoc(collection(firestore, 'flats'), {
          flatName:flatName,
          flatNum:flatNum,
          userEmails: arrayUnion(user.email),
        }); // adding info

        // Update user profile with flat number (if necessary)
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, { flatNum }, { merge: true });

        alert('Success', 'Flat created successfully');
        navigation.replace('Main');
      } catch (error) {
        console.error('Error creating flat: ', error);
        alert('Failed to create flat');
      } finally {
        setLoading(false);
      }
    } else {
      alert('No user logged in');
      setLoading(false);
    }
  };












   return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a Flat</Text>

      <TextInput
        style={styles.input}
        placeholder="Flat Name"
        value={flatName}
        onChangeText={setFlatName}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreateFlat} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Flat'}</Text>
      </TouchableOpacity>
    </View>
  );


  
}
export default CreateFlat;


const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing * 4,
      backgroundColor: '#FFFFFF',
    },
    title: {
      fontSize: FontSize.xxLarge,
      color: Colors.primary,
      marginBottom: Spacing * 3,
    },
    input: {
      width: '100%',
      padding: Spacing * 2,
      marginVertical: Spacing,
      borderColor: Colors.border,
      borderWidth: 1,
      borderRadius: Spacing,
    },
    button: {
      backgroundColor: Colors.primary,
      padding: Spacing * 2,
      borderRadius: Spacing,
      width: '100%',
      alignItems: 'center',
      marginTop: Spacing * 2,
    },
    buttonText: {
      color: Colors.onPrimary,
      fontSize: FontSize.large,
    },
  });