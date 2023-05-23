import React, { useEffect, useState } from 'react';
import { usePubNub } from 'pubnub-react';
import { sparrowChannel, submarineRegistrationChannel } from '../services/external/pubsub';
import { Submarine } from './App';

interface SubmarineRegistrationProps {
  submarines: Submarine[];
  setSubmarines: React.Dispatch<React.SetStateAction<Submarine[]>>
}

const SubmarineRegistration: React.FC<SubmarineRegistrationProps> = ({submarines, setSubmarines}) => {
  const pubNub = usePubNub();
  const [submarineRegistrationDone, setSubmarineRegistrationDone] = useState(false);

  const handleMessage = (messageEvent: { channel: any; message: { action: string; shipName: string; }; }) => {
    if (messageEvent.channel === submarineRegistrationChannel) {
      // Process the message received from the SubmarineRegistration component
      const { action, shipName } = messageEvent.message as {
        action: string;
        shipName: string;
      };

      if (action === 'name-exist-error') {
        setError("Ship name is aldready registered with jack sparrow")
        return
      }
      if(action === 'register-success'){
        pubNub.subscribe({channels: [sparrowChannel]});
        console.log('Submarine registered:', shipName);
        setSubmarineRegistrationDone(true)
        setError('');

      }       
    }
    if (messageEvent.channel === sparrowChannel) {
      // Process the message received from the SubmarineRegistration component
      const { action, shipName } = messageEvent.message as {
        action: string;
        shipName: string;
      };

      if (action === 'threat') {
        // const newSubmarines = submarines.map(submarine => {
        //   if (submarine.name == shipName) {
        //     return {...submarine, active: false};
        //   }
        //   return submarine;
        // });
        // setSubmarines(prevSubmarines => [...prevSubmarines, ...newSubmarines])
        setSubmarines(prevSubmarines =>
          prevSubmarines.map(submarine =>
            submarine.name == shipName ? { ...submarine, active: false } : submarine
          )
        );
        // const newSubmarine: Submarine = {
        //   name: shipName,
        //   active: true,
        //   registeredTime: new Date(),
        // };
        // setSubmarines(prevSubmarines => [...prevSubmarines, newSubmarine]);
        return
      }
    }
  };

  useEffect(() => {
    const listenerParams = { 
      message: handleMessage 
    }
    pubNub.addListener(listenerParams);
    pubNub.subscribe({
      channels: [submarineRegistrationChannel, sparrowChannel]
    });     
    return () => {
      pubNub.unsubscribeAll();
      pubNub.removeListener(listenerParams)
    }
  }, [pubNub, submarines]);

  const [shipName, setShipName] = useState('');
  const [error, setError] = useState('');

  const handleShipNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShipName(event.target.value);
    setError('');
  };

  const handleRegister = () => {
    if (!shipName) {
      setError('Ship name is required');
    }
    // Check if the ship name contains only alphanumeric characters
    else if (!/^[a-zA-Z0-9]+$/.test(shipName)) {
      setError('Ship name must be alphanumeric');
      return
    }
    else {
      const listenerParams = { 
        message: handleMessage 
      }
      pubNub.addListener(listenerParams);
      pubNub.subscribe({channels: [submarineRegistrationChannel, sparrowChannel]});

      const message = {
        action: 'register',
        shipName,
      };
      pubNub.publish({ channel : submarineRegistrationChannel, message })
    }
  };

  return (
    <div>
      { submarineRegistrationDone ? 
      <div>
        <h2>{shipName}</h2>
        <h1>{submarines.find((sub: { name: string; }) => sub.name === shipName)?.active}</h1>
        {/* <p>{submarines.find(sub => sub.name === shipName)?.active ? 'on Top' : 'down Under'}</p> */}
        {submarines.filter(sub => sub.active).map(submarine => (
        <div key={submarine.name}>
          <p>Name: {submarine.name}</p>
          <p>Status: {submarine.active ? 'Active' : 'Inactive'}</p>
          {/* <button onClick={() => handleHideSubmarine(submarine.name)}>Hide</button> */}
        </div>
      ))}
      </div> :
      <div>
        <h2>Submarine Registration</h2>
        <div>
          <label>Ship Name:</label>
          <input type="text" value={shipName} onChange={handleShipNameChange} />
          {error && <p className="error">{error}</p>}
        </div>
        <button onClick={handleRegister}>Register</button>
      </div>}
    </div>
  );
};

export default SubmarineRegistration;