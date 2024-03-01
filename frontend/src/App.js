import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/extra Codes/ProductScreen';
import ProjectScreen from './screens/ProjectScreen';
import RegisterForm from './screens/RegisterForm';
import LoginForm from './screens/LoginForm';
import Logout from './screens/Logout';
import AuthContext from './context/authContext';

import Categories from './screens/Categories';
import SwipePage from './screens/SwipePage';
import ProfileScreen from './screens/ProfileScreen';
import UserProfileDetail from './screens/UserProfileDetail';  // Import UserProfileDetail
import FavouritesScreen from './screens/FavouritesScreen';

import UserAccount from './screens/UserAccount';
import EditAccount from './screens/EditAccount';

import FollowingPage from './screens/FollowingPage';
import FollowersPage from './screens/FollowersPage';

import SettingsPage from './screens/SettingsPage';

import InboxSentMessages from './screens/extra Codes/InboxSentMessages';
import MsgForm from './screens/extra Codes/MsgForm';  // Make sure to provide the correct relative path to the MsgForm component
import MessageView from './screens/extra Codes/MessageView';  // Import the MessageView component

import AddProject from './screens/AddProject';
import ProjectForm from './screens/ProjectForm';
// import MsgThread from './screens/MsgThread.js';
// import SendMsg from './screens/SendMsg';  // Make sure to provide the correct relative path to the MsgForm component
// import InboxMsg from './screens/InboxMsg'; 
import EditProject from './screens/EditProject';

import Send from './screens/Send';  // Make sure to provide the correct relative path to the MsgForm component
import Thread from './screens/Thread'; 

import ThreadMessages from './screens/ThreadMessages'; 

import FollowedTagsPage from './screens/FollowedTagsPage';

import BlockedUsersPage from './screens/BlockedUsersPage';

import About from './screens/FooterPages/About';
import CookiePolicy from './screens/FooterPages/CookiePolicy';
import CopyrightPolicy from './screens/FooterPages/CopyrightPolicy';
import PrivacyPolicy from './screens/FooterPages/PrivacyPolicy';
import TermsOfService from './screens/FooterPages/TermsOfService';
import axios from 'axios';

import NotificationsPage from './screens/NotificationsPage';
import NotificationSettings from './screens/NotificationSettings';

import ChangePasswordForm from './screens/ChangePasswordForm';


import OtherUserFollowersPage from './screens/OtherUserFollowersPage';
import OtherUserFollowingPage from './screens/OtherUserFollowingPage';

import ForgotPasswordForm from './screens/ForgotPasswordForm';

import Main from './SwipeFunction/Main/Main';

import AttendingProjects from './screens/AttendingProjects';

import LargeMapScreen from './components/LargeMapScreen';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token'); 
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

    // Function to fetch user profile
    const fetchUserProfile = async (token) => {
      try {
        const response = await axios.get('/api/user/account/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        login(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        logout(); // Ensure user is logged out if there's an issue fetching the profile
      }
    };
  
    // Effect to authenticate the user on app load
    useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
        fetchUserProfile(token);
      }
    }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser  }}>
      <Router>
        <Header />
        <main className="py-3">
          <Container>
            <Routes>
              <Route path='/' element={<HomeScreen />} />
              <Route path='/product/:id' element={<ProductScreen />} />
              <Route path='/project/:id' element={<ProjectScreen />} />

              <Route path='/signup' element={<RegisterForm />} />
              <Route path='/login' element={<LoginForm />} />
              <Route path='/logout' element={<Logout />} />

              <Route path='/categories' element={<Categories />} />
              <Route path='/swipe-page' element={<SwipePage />} />

              <Route path='/profiles' element={<ProfileScreen />} />
              <Route path='/profiles/:id' element={<UserProfileDetail />} />  // Add this route for UserProfileDetail

              <Route path='/favourites' element={<FavouritesScreen />} />

              <Route path='/user/account' element={<UserAccount />} />
              <Route path='/user/edit-account' element={<EditAccount />} />

              <Route path='/following' element={<FollowingPage />} />
              <Route path='/followers' element={<FollowersPage />} />


              <Route path='/settings' element={<SettingsPage />} />


              <Route path='/inbox' element={<InboxSentMessages />} />
              <Route path='/send-message' element={<MsgForm />} />
              <Route path='/message/:messageId/:type' element={<MessageView />} />  // Route for the MessageView component

              {/* <Route path='/inbox1' element={<InboxMsg />} />
              <Route path='/send-message1' element={<SendMsg />} />
              <Route path='/message1/:thread_id/' element={<MsgThread />} /> */}


              <Route path="/send" element={<Send />} />
              <Route path="/thread/:threadId" element={<Thread />} />

              <Route path="/thread" element={<ThreadMessages />} />

              <Route path="/add-project" element={<AddProject />} />
              {/* <Route path="/edit-project/:projectId" element={<ProjectForm editMode={true} />} /> */}
              <Route path="/edit-project/:projectId" element={<EditProject />} />

              <Route path="/followed-tags" element={<FollowedTagsPage />} />
              
              <Route path="/blocked-users" element={<BlockedUsersPage />} />

              <Route path="/about" element={<About />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/copyright-policy" element={<CopyrightPolicy />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />

              <Route path="/notifications" element={<NotificationsPage />} />

              <Route path="/notification-settings" element={<NotificationSettings />} />

              <Route path="/change-password" element={<ChangePasswordForm />} />

              
              <Route path='/profiles/:profileId/followers' element={<OtherUserFollowersPage />} />
              <Route path='/profiles/:profileId/following' element={<OtherUserFollowingPage />} />

              <Route path='/forgot-password' element={<ForgotPasswordForm />} />

              <Route path='/main' element={<Main />} />

              <Route path='/attending' element={<AttendingProjects />} />

              <Route path='/map/:latitude/:longitude' element={<LargeMapScreen />} />


            </Routes>
          </Container>
        </main>
        <Footer />
      </Router>
    </AuthContext.Provider>
  );
}

export default App;