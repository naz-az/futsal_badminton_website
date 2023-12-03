import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

const CustomButton = ({ title, onPress, children, color = 'blue', textColor = 'white', fontSize = 16 }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, { backgroundColor: color }]}
    >
      <View style={styles.contentContainer}>
        {children} {/* Render the Icon or any other children */}
        <Text style={[styles.text, { color: textColor, fontSize }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 3, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  contentContainer: {
    flexDirection: 'row', // Align icon and text in a row
    alignItems: 'center', // Center items vertically
  },
  text: {
    fontWeight: 'bold',
    marginLeft: 10, // Space between icon and text
  },
});

export default CustomButton;