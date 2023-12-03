import React from 'react';
import { View, Picker, StyleSheet } from 'react-native';

const SortingComponent = ({ sortType, setSortType }) => {
    return (
        <View style={styles.sortingContainer}>
            <Picker
                selectedValue={sortType}
                onValueChange={(itemValue) => setSortType(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem} // Apply custom style to Picker.Item
            >
                <Picker.Item label="New to Old" value="newToOld" />
                <Picker.Item label="Old to New" value="oldToNew" />
                <Picker.Item label="Top to Low (Hotness)" value="topToLow" />
                <Picker.Item label="Low to Top (Hotness)" value="lowToTop" />
                <Picker.Item label="High to Low (Price)" value="highToLow" />
                <Picker.Item label="Low to High (Price)" value="lowToHigh" />
            </Picker>
        </View>
    );
};

const styles = StyleSheet.create({
    sortingContainer: {
        padding: 5,
        // marginVertical: 10,
        backgroundColor: '#ffffff', // A light grey background
        borderRadius: 10, // Rounded corners
        borderWidth: 1,
        borderColor: '#d1d1d1', // Light grey border for subtle definition
        shadowColor: '#000', // Shadow for a slight elevation effect
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 3, // Elevation for Android
        marginBottom:20,
    },
    picker: {
        height: 35, // Fixed height for picker
        width: '100%', // Full width
        color: '#333', // Text color
        backgroundColor: 'transparent', // Transparent background to blend with container
    },
    pickerItem: {
        fontSize: 12, // Set font size for Picker.Item
    }
});

export default SortingComponent;
