import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { usePubNub } from 'pubnub-react';
import { sparrowChannel, submarineRegistrationChannel } from '../services/external/pubsub';
import { Button } from 'antd';

const SubmarineDetails: React.FC = () => {
    const pubNub = usePubNub();
    const { name } = useParams();
    const { state } = useLocation();
    const submarines = state?.submarines || [];
    const [submarine, setSubmarine] = useState(submarines.find((sub: { name: string | undefined; }) => sub.name === name));    
    
    if (!submarine) {
        return <div>No Registered Submarine with Jack sparrow iunder this name</div>;
    }
    
    const handleSparrowMessage = (messageEvent: { channel: any; message: { action: string; shipName: string; }; }) => {
        if (messageEvent.channel === sparrowChannel) {
            // Process the message received from the SubmarineRegistration component
            const { action, shipName } = messageEvent.message as {
                action: string;
                shipName: string;
            };

            if (action === 'threat' || action === 'self-hide-success') {
                // let sub = submarines.find((sub: { name: string | undefined; }) => sub.name === shipName)
                if(shipName === name){
                    setSubmarine((prevSub: any) => {return{...prevSub,  active: false }})
                } 
                return
            }
        }
    };

    const handleSubmarineHide = () =>{
        const message = {
            action: 'self-hide',
            shipName: name,
        };
        pubNub.publish({ channel : submarineRegistrationChannel, message })
    }

    useEffect(()=>{
        const listenerParams = { 
            message: handleSparrowMessage 
        }
        pubNub.addListener(listenerParams);
        pubNub.subscribe({channels: [sparrowChannel]});
    })

    return (
        <div>
        <h1>Submarine Details</h1>
        <p>Name: {submarine.name}</p>
        <p>Status: {submarine.active ? 'Active' : 'Inactive'}</p>
        <p>Registered Time: {submarine.registeredTime}</p>
        <Button disabled={!submarine.active} onClick={handleSubmarineHide}>Hide</Button>
        </div>
    );
};

export default SubmarineDetails;
