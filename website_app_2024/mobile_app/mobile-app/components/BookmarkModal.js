import React from 'react';
import { Modal, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";

const BookmarkModal = ({ visible, message, onDismiss, showButton }) => {
    const navigation = useNavigation();

    const navigateToFavorites = async () => {
                // Close the modal before navigating
                onDismiss();
        // Perform any logic here if needed
        navigation.navigate('FavouritesScreen'); // Make sure 'SendScreen' is defined in your navigator
      };

      

      return (
        <Modal
          animationType="slide"
          transparent={true}
          visible={visible}
          onRequestClose={onDismiss}
        >
          <TouchableOpacity
            style={styles.centeredView}
            activeOpacity={1}
            onPressOut={onDismiss} // Close modal when pressed outside
          >
            <View style={styles.modalContent}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>{message}</Text>
                {showButton && (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={navigateToFavorites}
                  >
                    <Text style={styles.buttonText}>View All Bookmarks</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      );
    };

    const styles = StyleSheet.create({
      centeredView: {
        flex: 1,
        justifyContent: 'flex-start', // Align to the top
        alignItems: 'center',         // Keep it centered horizontally
        paddingTop: 50,               // Add some padding at the top
        backgroundColor: 'transparent',
      },
        modalContent: {
          margin: 20,
        },
        modalView: {
          backgroundColor: '#fcf9ffeb',
          borderRadius: 20,
          padding: 20,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        },
        modalText: {
          marginBottom: 10,
          textAlign: 'center',
          fontSize: 14,
          fontWeight: 'bold',
          color: '#333',
        },
        button: {
          borderRadius: 20,
          padding: 10,
          elevation: 2,
          backgroundColor: '#543250',
        },
        buttonText: {
          color: 'white',
          fontWeight: 'bold',
          textAlign: 'center',
          fontSize: 14,

        },
      });
      
      export default BookmarkModal;