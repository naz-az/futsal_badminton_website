import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

function Pagination({ currentPage, projectsLength, projectsPerPage, setCurrentPage }) {
    const totalPages = Math.ceil(projectsLength / projectsPerPage);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={() => setCurrentPage(1)}
                disabled={currentPage === 1}
            >
                <Text style={currentPage === 1 ? styles.textDisabled : styles.text}>First Page</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
                onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
            >
                <Text style={currentPage === 1 ? styles.textDisabled : styles.text}>Prev</Text>
            </TouchableOpacity>
            {Array.from({ length: totalPages }, (_, idx) => (
                <TouchableOpacity
                    style={styles.button}
                    key={idx}
                    onPress={() => setCurrentPage(idx + 1)}
                >
                    <Text style={idx + 1 === currentPage ? styles.textActive : styles.text}>{idx + 1}</Text>
                </TouchableOpacity>
            ))}
            <TouchableOpacity
                style={styles.button}
                onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
            >
                <Text style={currentPage === totalPages ? styles.textDisabled : styles.text}>Next</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
                onPress={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
            >
                <Text style={currentPage === totalPages ? styles.textDisabled : styles.text}>Last Page</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    button: {
        marginHorizontal: 5,
        padding: 10,
    },
    text: {
        color: 'black', // Define your normal text color here
    },
    textActive: {
        color: 'blue', // Define your active page text color here
    },
    textDisabled: {
        color: 'grey', // Define your disabled text color here
    },
});

export default Pagination;
