import React, { useEffect, useState } from 'react';
import { List, Button } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { usePubNub } from 'pubnub-react';
import { sparrowChannel, submarineRegistrationChannel } from '../services/external/pubsub';
import { Submarine } from './App';
import './control-room.scss';

const ControlRoom: React.FC = () => {
    const pubNub = usePubNub();
    const [submarines, setSubmarines ] = useState<Submarine[]>([]);
    
    const handleMessage = (messageEvent: { channel: any; message: { action: string; shipName: string; }; }) => {
        if (messageEvent.channel === submarineRegistrationChannel) {
            const { action, shipName } = messageEvent.message as {
                action: string;
                shipName: string;
            };
  
            if (action === 'register') {
                const existingSubmarine = submarines.find((sub) => sub.name === shipName);
                if (existingSubmarine) {
                    const message = {
                        action: 'name-exist-error',
                        shipName,
                    };
                    pubNub.publish({ channel : submarineRegistrationChannel, message })
                    return
                }
                const newSubmarine: Submarine = {
                    name: shipName,
                    active: true,
                    registeredTime: new Date(),
                };
                setSubmarines(prevSubmarines => [...prevSubmarines, newSubmarine]);
                const message = {
                    action: 'register-success',
                    newSubmarine,
                    submarineList: [...submarines, newSubmarine]
                };
                pubNub.publish({ channel : submarineRegistrationChannel, message })
                return
            }
            if(action === 'self-hide') {
                let subIndex = submarines.findIndex(sub => sub.name === shipName);
                const newSubmarines = [...submarines]
                newSubmarines[subIndex] = {...newSubmarines[subIndex], active:false};
                setSubmarines(newSubmarines);
                const message = {
                    action: 'self-hide-success',
                    shipName,
                };
                pubNub.publish({ channel : sparrowChannel, message })
            }
        }
    }

    useEffect(() => {
        const listenerParams = { 
          message: handleMessage,
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
        setSubmarines(prevSubmarines =>
            prevSubmarines.map(submarine =>
                submarine.name == name ? { ...submarine, active: false } : submarine
            )
        );
    }
  return (
    <div className="submarine-list">
        <h3>Active Submarines</h3>
        <List
            dataSource={submarines.filter(sub => sub.active)}
            renderItem={submarine => (
            <List.Item>
                <List.Item.Meta
                title={submarine.name}
                description={`Status: ${submarine.active ? 'Active' : 'Inactive'}`}
                />
                <Button
                type="primary"
                icon={<EyeInvisibleOutlined />}
                onClick={() => handleHideSubmarine(submarine.name)}
                >
                Hide
                </Button>
            </List.Item>
            )}
        />
        <h3>Hidden Submarines</h3>
        <List
            dataSource={submarines.filter(sub => !sub.active)}
            renderItem={submarine => (
            <List.Item>
                <List.Item.Meta
                title={submarine.name}
                description={`Status: ${submarine.active ? 'Active' : 'Inactive'}`}
                />
            </List.Item>
            )}
        />
    </div>
  );
};

export default ControlRoom;