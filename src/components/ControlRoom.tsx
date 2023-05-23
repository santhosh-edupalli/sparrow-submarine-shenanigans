import React, { useEffect, useState } from 'react';
import { usePubNub } from 'pubnub-react';
import { sparrowChannel, submarineRegistrationChannel } from '../services/external/pubsub';
import { PresenceEvent } from 'pubnub';
import { Submarine } from './App';

interface ControlRoomProps {
    submarines: Submarine[];
    setSubmarines: React.Dispatch<React.SetStateAction<Submarine[]>>
}
const ControlRoom: React.FC<ControlRoomProps> = ({submarines, setSubmarines}) => {
    const pubNub = usePubNub();
    
    const handleMessage = (messageEvent: { channel: any; message: { action: string; shipName: string; }; }) => {
        if (messageEvent.channel === submarineRegistrationChannel) {
            // Process the message received from the SubmarineRegistration component
            const { action, shipName } = messageEvent.message as {
              action: string;
              shipName: string;
            };
  
            if (action === 'register') {
                // Check if the ship name is already registered with Jack Sparrow
                const existingSubmarine = submarines.find((sub) => sub.name === shipName);
                if (existingSubmarine) {
                    const message = {
                        action: 'name-exist-error',
                        shipName,
                    };
                    pubNub.publish({ channel : submarineRegistrationChannel, message })
                    return
                }
                // Add the registered submarine to the list
                const newSubmarine: Submarine = {
                  name: shipName,
                  active: true,
                  registeredTime: new Date(),
                };
                setSubmarines(prevSubmarines => [...prevSubmarines, newSubmarine]);

                const message = {
                    action: 'register-success',
                    shipName,
                };
                pubNub.publish({ channel : submarineRegistrationChannel, message })
                return
            }
        }
    }

    useEffect(() => {
        const listenerParams = { 
          message: handleMessage,
        //   presence : handlePresence, 
        }
        pubNub.addListener(listenerParams);
        pubNub.subscribe({
            channels: [submarineRegistrationChannel]
        });        
        return () => {
            pubNub.unsubscribeAll();
            pubNub.removeListener(listenerParams);
        }
    }, [pubNub, submarines]);

    const handleHideSubmarine = (name: string) =>{
        const message = {
            action: 'threat',
            shipName : name,
        };
        pubNub.publish({ channel : sparrowChannel, message })
    }
  return (
    <div>
      <h2>Active Submarines</h2>
      {submarines.filter(sub => sub.active).map(submarine => (
        <div key={submarine.name}>
          <p>Name: {submarine.name}</p>
          <p>Status: {submarine.active ? 'Active' : 'Inactive'}</p>
          <button onClick={() => handleHideSubmarine(submarine.name)}>Hide</button>
        </div>
      ))}
    </div>
  );
};

export default ControlRoom;