import React, { useEffect, useState } from 'react';
import { Input, Button } from 'antd';
import { usePubNub } from 'pubnub-react';
import { useNavigate } from "react-router-dom";
import { sparrowChannel, submarineRegistrationChannel } from '../services/external/pubsub';
import { Submarine } from './App';
import './submarine-registration.scss'

interface SubmarineRegistrationProps {
  submarines: Submarine[];
  setSubmarines: React.Dispatch<React.SetStateAction<Submarine[]>>
}

const SubmarineRegistration: React.FC = () => {
  const pubNub = usePubNub();
  const navigate = useNavigate();
  const [shipName, setShipName] = useState('');
  const [error, setError] = useState('');

  const handleMessage = (messageEvent: { channel: any; message: { action: string; shipName: string; }; }) => {
	if (messageEvent.channel === submarineRegistrationChannel) {
	  // Process the message received from the SubmarineRegistration component
	  const { action, shipName, newSubmarine, submarineList } = messageEvent.message as {
		action: string;
		shipName: string;
		newSubmarine: Submarine;
		submarineList:Submarine[];
	  };

	  if (action === 'name-exist-error') {
		setError("Ship name is aldready registered with jack sparrow")
		return
	  }
	  if(action === 'register-success'){
		const listenerParams = { 
		  message: handleMessage 
		}
		pubNub.addListener(listenerParams);
		pubNub.subscribe({channels: [sparrowChannel]});
		navigate(`/submarines/${newSubmarine.name}`, { state: {submarines: submarineList} });
		console.log('Submarine registered:', newSubmarine.name);
		setError('');
	  }       
	}
  };

  useEffect(() => {
	const listenerParams = { 
	  message: handleMessage 
	}
	pubNub.addListener(listenerParams);
	pubNub.subscribe({
	  channels: [submarineRegistrationChannel]
	});     
	return () => {
	  pubNub.unsubscribeAll();
	  pubNub.removeListener(listenerParams)
	}
  }, [pubNub]);

  const handleShipNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
	setShipName(event.target.value);
	setError('');
  };

  const handleRegister = () => {
	if (!shipName) {
	  setError('Ship name is required');
	}
	else if (!/^[a-zA-Z0-9]+$/.test(shipName)) {
	  setError('Ship name must be alphanumeric');
	  return
	}
	else {
	  pubNub.subscribe({channels: [submarineRegistrationChannel]});

	  const message = {
		action: 'register',
		shipName,
	  };
	  pubNub.publish({ channel : submarineRegistrationChannel, message })
	}
  };
  return (
	<div className="registration-container">
      <div>
        <h4>Submarine Registration</h4>
        <div>
          <label>Ship Name:</label>
          <Input type="text" value={shipName} onChange={handleShipNameChange} />
          {error && <p className="error">{error}</p>}
        </div>
        <Button className="register-button" type="primary" onClick={handleRegister}>
          Register
        </Button>
      </div>
    </div>
  );
};

export default SubmarineRegistration;