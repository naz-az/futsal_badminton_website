import React, { useState, useEffect } from 'react';
import { View, Switch, Text, TouchableOpacity, Alert, StyleSheet, Modal, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationSettings = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    newFollowers: true,
    newCommentOnProject: true,
    newUpvoteOnProject: true,
    newMessage: true,
    newRepliedComment: true,
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmSettingType, setConfirmSettingType] = useState(null);
  const [pendingSettings, setPendingSettings] = useState({});

  // Fetch settings when component mounts
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/get_notification_settings/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationSettings({
          newFollowers: data.notify_new_followers,
          newCommentOnProject: data.notify_new_comment_on_project,
          newUpvoteOnProject: data.notify_new_upvote_on_project,
          newMessage: data.notify_new_messages,
          newRepliedComment: data.notify_new_replied_comment,
        });
      } else {
        console.error('Failed to fetch notification settings');
      }
    };

    fetchNotificationSettings();
  }, []);

  const saveNotificationSettings = async (endpoint, settings) => {
    const token = await AsyncStorage.getItem('token');
  
    const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ value: settings.value }),
    });
  
    if (!response.ok) {
      throw new Error('Failed to update notification settings');
    }
  };

  const settingMapping = {
    newFollowers: 'new_followers',
    newCommentOnProject: 'new_comment_on_project',
    newUpvoteOnProject: 'new_upvote_on_project',
    newMessage: 'new_messages',
    newRepliedComment: 'new_replied_comment',
  };

  const handleToggleChange = (type) => async (e) => {
    const newValue = e; // React Native Switch returns a boolean directly

    if (!newValue) {
      setShowConfirmModal(true);
      setConfirmSettingType(type);
      setPendingSettings((prevSettings) => ({
        ...prevSettings,
        [type]: newValue,
      }));
    } else {
      const backendSettingName = settingMapping[type];
      const endpoint = `/api/update_notify_${backendSettingName}/`;
      setNotificationSettings((prevSettings) => ({
        ...prevSettings,
        [type]: newValue,
      }));
      try {
        await saveNotificationSettings(endpoint, { type: backendSettingName, value: newValue });
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }
  };

  const handleConfirmToggle = async () => {
    const backendSettingName = settingMapping[confirmSettingType];
    const newValue = pendingSettings[confirmSettingType];
    const endpoint = `/api/update_notify_${backendSettingName}/`;

    try {
      await saveNotificationSettings(endpoint, { type: backendSettingName, value: newValue });
      setNotificationSettings((prevSettings) => ({
        ...prevSettings,
        [confirmSettingType]: newValue,
      }));
      setShowConfirmModal(false);
      setConfirmSettingType(null);
    } catch (error) {
      console.error('Failed to confirm settings:', error);
    }
  };

  const formatNotificationType = (type) => {
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  const renderSetting = (type) => {
    return (
      <View style={styles.settingContainer} key={type}> {/* Add the key prop here */}
        <Text style={styles.settingText}>{formatNotificationType(type)}</Text>
        <Switch
          onValueChange={handleToggleChange(type)}
          value={notificationSettings[type]}
        />
      </View>
    );
  };
  

  const renderConfirmModal = () => {
    return (
      <Modal
        visible={showConfirmModal}
        onRequestClose={() => setShowConfirmModal(false)}
        animationType="slide"
        transparent={false}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirm Notification Setting</Text>
          <Text style={styles.modalBody}>
            Are you sure you want to disable notifications for {confirmSettingTypeDescription(confirmSettingType)}?
          </Text>
          <View style={styles.modalFooter}>
            <Button title="Cancel" onPress={() => setShowConfirmModal(false)} />
            <Button title="Confirm" onPress={handleConfirmToggle} />
          </View>
        </View>
      </Modal>
    );
  };


  const confirmSettingTypeDescription = (type) => {
    switch (type) {
      case 'newFollowers':
        return 'New Followers';
      case 'newCommentOnProject':
        return 'New Comment on Project';
      case 'newUpvoteOnProject':
        return 'New Upvote on Project';
      case 'newMessage':
        return 'New Messages';
      case 'newRepliedComment':
        return 'New Replied Comments';
      default:
        return '';
    }
  };

  
  return (
    <View style={styles.container}>
      {Object.keys(notificationSettings).map((setting) => renderSetting(setting))}
      {renderConfirmModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  settingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  settingText: {
    fontSize: 16,
  },
});

export default NotificationSettings;
