import PubNub from 'pubnub';

// Initialize PubNub client
const pubnubClient = new PubNub({
  publishKey: `pub-c-b58f5d62-7bb6-4c46-b225-4090c3128193`,
  subscribeKey: `sub-c-8226b1af-2ef6-4df5-b170-c2bb8330a5f8`,
  uuid: 'sec-c-YjA1OTg5ZGQtMzIxZi00ZmFjLWEzZWQtNDM1MzNkODEyYTRk'
});


const sparrowChannel = "sparrow-channel";
const submarineRegistrationChannel = "submarine-registration-channel";

export { sparrowChannel, pubnubClient, submarineRegistrationChannel } 