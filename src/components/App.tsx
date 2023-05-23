import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ControlRoom from './ControlRoom';
import SubmarineRegistration from './SubmarineRegistration';
import { pubnubClient } from '../services/external/pubsub';
import { PubNubProvider } from 'pubnub-react';

export interface Submarine {
  name: string;
  active: boolean;
  registeredTime: Date;
}

const App: React.FC = () => {
  const [subMarines, setSubmarines] = useState<Submarine[]>([]);
  return (
    <>
    <PubNubProvider client={pubnubClient}>
    <Router>
        <nav>
          <ul>
            <li>
              <Link to="/">Control Room</Link>
            </li>
            <li>
              <Link to="/reg">Submarine Registration</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<ControlRoom submarines={subMarines} setSubmarines={setSubmarines}/>} />
          <Route path="/reg" element={<SubmarineRegistration submarines={subMarines} setSubmarines={setSubmarines}/>} />
        </Routes>
    </Router>
    </PubNubProvider>
    </>
  );
};

export default App;
