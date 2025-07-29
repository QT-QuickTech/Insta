
import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Home from './components/Home';
import Explore from './components/Explore';
import Reels from './components/Reels';
import Message from './components/Message';
import Create from './components/Create';
import Profile from './components/Profile';
import More from './components/More';
import Login from './components/Login';
import Logout from './components/Logout';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './components/Register';

function ProfileWithKey() {
  const { username } = useParams();
  return <Profile key={username || 'mock'} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
        <Route
          path="/user/:username"
          element={
            <ProtectedRoute>
              <MainLayout noSidebarSelection>
                <ProfileWithKey />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/reels" element={<Reels />} />
          <Route path="/message" element={<Message />} />
          <Route path="/create" element={<Create />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/more" element={<More />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;



