import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const MsgThreadPage = () => {
  const [thread, setThread] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const { threadId } = useParams();

  const config = {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  };

  useEffect(() => {
    fetch(`/api/threads/${threadId}/`, { headers: config.headers })
      .then(response => response.json())
      .then(data => setThread(data))
      .catch(error => console.error('Error fetching the thread:', error));
  }, [threadId]);

  const handleSendMessage = () => {
    fetch(`/api/create-message/${threadId}/`, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify({ body: messageContent })
    }).then(() => {
      setMessageContent('');
      // Re-fetch the thread to include the new message
      fetch(`/api/threads/${threadId}/`, { headers: config.headers })
        .then(response => response.json())
        .then(data => setThread(data));
    });
  };

  return (
    <div>
      {thread.map(message => (
        <div key={message.id}>
          <img src={message.sender.imageURL} alt="Sender Avatar" />
          <p>{message.body}</p>
        </div>
      ))}
      <textarea value={messageContent} onChange={e => setMessageContent(e.target.value)} />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default MsgThreadPage;
