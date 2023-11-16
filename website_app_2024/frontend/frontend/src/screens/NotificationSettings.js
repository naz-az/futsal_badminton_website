import React, { useState, useEffect } from "react";
import {
  Form,
  Card,
  Container,
  Row,
  Col,
  Button,
  Modal,
} from "react-bootstrap";

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

  // This effect will fetch the notification settings when the component mounts
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/get_notification_settings/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the Authorization header
        },
      });

      console.log(
        `Response Status: ${response.status}`,
        `Response Status Text: ${response.statusText}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Received notification settings data:", data);

        setNotificationSettings({
          newFollowers: data.notify_new_followers,
          newCommentOnProject: data.notify_new_comment_on_project,
          newUpvoteOnProject: data.notify_new_upvote_on_project,
          newMessage: data.notify_new_messages,
          newRepliedComment: data.notify_new_replied_comment,
        });
      } else {
        // Handle errors
        console.error("Failed to fetch notification settings");
      }
    };

    fetchNotificationSettings();
  }, []);

  const saveNotificationSettings = async (endpoint, settings) => {
    const token = localStorage.getItem("token");
  
    console.log(`Backend setting name: ${settings.type}`); // This will log the backend setting name
  
    const response = await fetch(endpoint, { // Endpoint should already be constructed with the correct setting type
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ value: settings.value }),
    });
  
    if (!response.ok) {
      throw new Error('Failed to update notification settings');
    }
  };
  


  // Handler for toggling notifications

// Adjust the settingMapping to just include the backend names without "notify_"
const settingMapping = {
  newFollowers: "new_followers",
  newCommentOnProject: "new_comment_on_project",
  newUpvoteOnProject: "new_upvote_on_project",
  newMessage: "new_messages",
  newRepliedComment: "new_replied_comment",
};

// Handler for toggling notifications
const handleToggleChange = (type) => (e) => {
  const newValue = e.target.checked;

  // If the user is trying to turn off the notification, show confirmation modal
  if (!newValue) {
    setShowConfirmModal(true);
    setConfirmSettingType(type);
    // Store pending settings in case user confirms
    setPendingSettings((prevSettings) => ({
      ...prevSettings,
      [type]: newValue,
    }));
  } else {
    // If the user is turning on the notification, save it directly
    const backendSettingName = settingMapping[type];
    if (!backendSettingName) {
      console.error(`Invalid setting type: ${type}`);
      return;
    }
    // Construct the endpoint correctly
    const endpoint = `/api/update_notify_${backendSettingName}/`;

    // Update settings state
    setNotificationSettings((prevSettings) => ({
      ...prevSettings,
      [type]: newValue,
    }));

    // Save the updated settings
    saveNotificationSettings(endpoint, { type: backendSettingName, value: newValue })
      .then(() => {
        console.log(`${backendSettingName} setting saved successfully.`);
      })
      .catch(error => {
        console.error("Failed to save settings:", error);
      });
  }
};

// Confirm toggle handler
const handleConfirmToggle = async () => {
  const backendSettingName = settingMapping[confirmSettingType];
  const newValue = pendingSettings[confirmSettingType];

  if (!backendSettingName) {
    console.error(`Invalid setting type: ${confirmSettingType}`);
    return;
  }
  // Construct the endpoint correctly
  const endpoint = `/api/update_notify_${backendSettingName}/`;

  try {
    await saveNotificationSettings(endpoint, { type: backendSettingName, value: newValue });
    // Update state based on the response
    setNotificationSettings(prevSettings => ({
      ...prevSettings,
      [confirmSettingType]: newValue,
    }));
    setPendingSettings(prevPendingSettings => {
      const newPendingSettings = { ...prevPendingSettings };
      delete newPendingSettings[confirmSettingType];
      return newPendingSettings;
    });
    setShowConfirmModal(false);
    setConfirmSettingType(null);
  } catch (error) {
    console.error("Failed to confirm settings:", error);
  }
};




  // Function to format the notification type string
  const formatNotificationType = (type) => {
    return type
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="text-center mb-4">Notification Settings</h1>
          {Object.keys(notificationSettings).map((type) => (
            <div key={type} className="mb-5">
              <h5 className="mb-3">{formatNotificationType(type)}</h5>
              <Card>
                <Card.Body>
                  <Form.Group
                    controlId={`switch-${type}`}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <Form.Label>
                      Enable Notifications for {formatNotificationType(type)}
                    </Form.Label>
                    <Form.Check
                      type="switch"
                      id={`custom-switch-${type}`}
                      checked={notificationSettings[type]}
                      onChange={handleToggleChange(type)}
                      label=""
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </div>
          ))}
        </Col>
      </Row>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Notification Setting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to disable notifications for{" "}
          {confirmSettingType === "newCommentOnProject"
            ? "new comments on your project"
            : confirmSettingType === "newRepliedComment"
            ? "new replies to your comments"
            : confirmSettingType === "newUpvoteOnProject"
            ? "new upvotes on your project"
            : confirmSettingType === "newMessage"
            ? "new messages"
            : confirmSettingType === "newFollowers"
            ? "new followers"
            : "this setting"}
          ?
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmToggle}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default NotificationSettings;