import { useState, useEffect } from 'react';
import { useMicrophoneAndCameraTracks } from './settings.js';
import Video from './Video';
import { getAccessToken } from './getAccessToken.js';
import { createClient } from 'agora-rtc-react';

export default function VideoCall(props) {
  const { setInCall, token, channel } = props;
  const [users, setUsers] = useState([]);
  const [start, setStart] = useState(false);
  const { ready, tracks } = useMicrophoneAndCameraTracks();
  const [config, setConfig] = useState();
  const [channelName, setChannelName] = useState();
  const [patientUid, setPatientUid] = useState();
  const [client, setClient] = useState();
  const [notifications, setNotifications] = useState({});
  const [disconnected, setDisconnected] = useState({
    user: '',
    status: false,
    count: 0,
  });
  const [reconnected, setReconnected] = useState({ user: '', count: 0 });
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    setLocalState();
  }, []);

  useEffect(() => {
    if (client) {
      const clientStats = client.getRTCStats();
      console.log('Stats: ', clientStats);

      if (!timeRemaining) setTimeRemaining(900 - clientStats.Duration);
    }
  }, [users]);

  // if (clientStats.Duration >= 600 && clientStats.Duration < 900) {
  //   setNotifications({
  //     msg: '5 minutes left',
  //     duration: 3000,
  //     position: 'top-right',
  //   });
  // } else if (clientStats.Duration >= 840 && clientStats.Duration < 900) {
  //   if (window.confirm('Do you wish to extend the meeting by 2 minutes?'))
  //     alert('Meeting extended by 2 minutes.');
  // } else if (clientStats.Duration >= 900) {
  //   setNotifications({
  //     msg: 'Time limit reached. Meeting is about to end.',
  //     duration: 3000,
  //     position: 'top-right',
  //   });
  // }

  const setLocalState = async () => {
    setChannelName(channel);
    setPatientUid('61f1008b4776a22710c932c2');
    const configurations = {
      mode: 'rtc',
      codec: 'vp8',
      appId: '65b90aaaa55941c98656335b181c00db',
      token: token,
    };
    setConfig(configurations);
    const createdClient = createClient(configurations);
    setClient(createdClient);
  };

  useEffect(() => {
    let init = async (name) => {
      if (client && config) {
        try {
          await client.join(config.appId, name, config.token, patientUid);
          setNotifications({
            msg: 'Joined the channel successfully',
            duration: 3000,
            position: 'top-right',
          });
        } catch (error) {
          console.log('error');
        }

        if (tracks) await client.publish([tracks[0], tracks[1]]);
        setStart(true);

        client.on('user-joined', (user) => {
          console.log('Joined user: ', user);
          // console.log(disconnected, user);
          if (user.uid == disconnected.user && disconnected.status) {
            setNotifications({
              msg: 'User reconnected to the channel',
              duration: 3000,
              position: 'top-right',
            });

            setReconnected((ps) => {
              return { ...ps, user: user.uid, count: ps.count + 1 };
            });
            setDisconnected((ps) => {
              return { ...ps, status: false };
            });
          } else {
            setNotifications({
              msg: 'User joined the channel',
              duration: 3000,
              position: 'top-right',
            });
          }
        });
        client.on('user-published', (user, mediaType) => {
          client
            .subscribe(user, mediaType)
            .then(() => console.log('Subscribed'))
            .catch((err) => console.log(err));

          if (mediaType === 'video') {
            setUsers((prevUsers) => {
              return [...prevUsers, user];
            });
          }
          if (mediaType === 'audio') {
            if (user.audioTrack) {
              user.audioTrack.play();
            }
          }
        });

        client.on('network-quality', (stats) => {
          if (
            stats.downlinkNetworkQuality > 3 ||
            stats.uplinkNetworkQuality > 3
          ) {
            setNotifications({
              msg: 'Poor Network Quality',
              duration: 1000,
              position: 'top-right',
            });
          }
        });

        // client.on('connection-state-change', (curState, revState) => {
        //   console.log('here');
        //   if (curState === 'DISCONNECTED' && revState === 'RECONNECTING') {
        //     console.log('Disconnected from the channel');
        //     setNotifications({
        //       msg: 'Disconnected from the channel',
        //       duration: 1000,
        //       position: 'top-right',
        //     });
        //   } else if (curState === 'CONNECTING' && revState === 'DISCONNECTED') {
        //     console.log('Connected to the channel');
        //     setNotifications({
        //       msg: 'Connected to the channel',
        //       duration: 1000,
        //       position: 'top-right',
        //     });
        //   }
        // });

        client.on('token-privilege-will-expire', async function () {
          setNotifications({
            msg: 'Call will end in 30 seconds',
            duration: 3000,
            position: 'top-right',
          });

          // After requesting a new token
          // await client.renewToken(token);
        });

        client.on('token-privilege-did-expire', async () => {
          setNotifications({
            msg: 'Call ended',
            duration: 3000,
            position: 'top-right',
          });
          // After requesting a new token
          // await client.join(<APPID>, <CHANNEL NAME>, <NEW TOKEN>);
        });

        client.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'audio') {
            if (user.audioTrack) {
              user.audioTrack.stop();
            }
          }
          if (mediaType === 'video') {
            setUsers((prevUsers) => {
              return prevUsers.filter((User) => User.uid !== user.uid);
            });
          }
        });

        client.on('user-left', (user, reason) => {
          setUsers((prevUsers) => {
            return prevUsers.filter((User) => User.uid !== user.uid);
          });
          setDisconnected((ps) => {
            return {
              ...ps,
              user: user.uid,
              status: true,
              count: ps.count + 1,
            };
          });
          if (reason === 'ServerTimeOut') {
            setNotifications({
              msg: 'User disconnected from the channel',
              duration: 3000,
              position: 'top-right',
            });
          } else {
            setNotifications({
              msg: 'User left the channel',
              duration: 3000,
              position: 'top-right',
            });
          }
        });

        client.on('exception', function (evt) {
          console.log(evt.code, evt.msg, evt.uid);
          if (evt.code === 1002 || evt.code === 1003) {
            setNotifications({
              msg: 'Poor Video Quality',
              duration: 1000,
              position: 'top-right',
            });
          }
          if (evt.code === 2001 || evt.code === 2003) {
            setNotifications({
              msg: 'Poor Audio Quality',
              duration: 1000,
              position: 'top-right',
            });
          }
        });
      }
      // AgoraRTC.enableLogUpload();
      // AgoraRTC.setLogLevel(0);
    };

    if (ready && tracks) {
      try {
        init(channelName);
      } catch (error) {
        console.log(error);
      }
    }
  }, [client, ready, tracks]);

  return (
    <div style={{ height: '100%' }}>
      {start && tracks && (
        <Video
          tracks={tracks}
          users={users}
          setStart={setStart}
          setInCall={setInCall}
          config={config}
          notifications={notifications}
        />
      )}
    </div>
  );
}
