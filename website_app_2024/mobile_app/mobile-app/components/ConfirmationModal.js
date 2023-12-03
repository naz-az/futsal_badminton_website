import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';


const ConfirmationModal = ({ modalVisible, setModalVisible, onConfirm, actionType = 'perform this action' }) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
    >
        <TouchableOpacity
            style={styles.centeredView}
            activeOpacity={1} // Prevents the opacity change on touch
            onPressOut={() => setModalVisible(!modalVisible)} // Closes the modal when the area outside the modal is touched
        >
            <View style={styles.modalView} onStartShouldSetResponder={() => true}> {/* Prevents closing when modal itself is touched */}
                <Text style={styles.modalText}>Are you sure you want to {actionType}?</Text>
                <View style={styles.modalButtons}>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => setModalVisible(!modalVisible)}
                    >
                        <Text style={styles.textStyle}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonConfirm]}
                        onPress={() => {
                            setModalVisible(!modalVisible);
                            onConfirm();
                        }}
                    >
                        <Text style={styles.textStyle}>Confirm</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    </Modal>
);
const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        // backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center'
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%'
    },
    button: {
        borderRadius: 5,
        padding: 10,
        elevation: 2
    },
    buttonClose: {
        backgroundColor: '#30829c',
    },
    buttonConfirm: {
        backgroundColor: '#7c2888',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center'
    }
});

export default ConfirmationModal;
