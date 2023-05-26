import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Menu } from 'antd';
import ControlRoom from './ControlRoom';
import SubmarineRegistration from './SubmarineRegistration';
import SubmarineDetails  from './SubmarineDetails';
import { pubnubClient } from '../services/external/pubsub';
import { PubNubProvider } from 'pubnub-react';
import './app.scss';

export interface Submarine {
  name: string;
  active: boolean;
  registeredTime: Date;
}

const App: React.FC = () => {
  return (
    <>
    <PubNubProvider client={pubnubClient}>
    <Router>
        <Menu mode="horizontal" theme="dark" className="navigation">
          <Menu.Item key="home" className="navigation-item">
            <Link to="/">Sparrow SC</Link>
          </Menu.Item>
          <Menu.Item key="registration" className="navigation-item">
            <Link to="/registration">Registration</Link>
          </Menu.Item>
        </Menu>
        <Routes>
          <Route path="/" element={<ControlRoom />} />
          <Route path="/registration" element={<SubmarineRegistration />} />
          <Route path="/submarines/:name" element={<SubmarineDetails />} />
        </Routes>
    </Router>
    </PubNubProvider>
    </>
  );
};

export default App;
