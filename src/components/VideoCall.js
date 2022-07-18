import { useState, useEffect } from 'react';

import { useMicrophoneAndCameraTracks } from './settings.js';
import Video from './Video';
import { createClient } from 'agora-rtc-react';

export default function VideoCall(props) {
  const { setInCall } = props;
  const meeting = props.meeting.newMeeting;
  const appId = props.meeting.app_id;
  const [users, setUsers] = useState([]);
  const [start, setStart] = useState(false);
  const { ready, tracks } = useMicrophoneAndCameraTracks();
  const [client, setClient] = useState();
  const [config, setConfig] = useState();
  const [notifications, setNotifications] = useState({});
  const [uplink, setUplink] = useState(0);
  const [downlink, setDownlink] = useState(0);

  useEffect(() => {
    setLocalState();
  }, []);

  // if (clientStats.Duration >= 600 && clientStats.Duration < 900) {
  //   setNotifications({
  //     msg: '5 minutes left',
  //     duration: 3000,
  //     position: 'top-right',
  //   });
  // } else if (clientStats.Duration >= 840 && clientStats.Duration < 900) {
  //   if (window.confirm('Do you wish to extend the meeting by 2 minutes?')) {
  //     alert('Meeting extended by 2 minutes.');
  //   }
  // } else if (clientStats.Duration >= 900) {
  //   setNotifications({
  //     msg: 'Time limit reached. Meeting is about to end.',
  //     duration: 3000,
  //     position: 'top-right',
  //   });
  // }

  const setLocalState = () => {
    try {
      if (meeting) {
        const configurations = {
          mode: 'rtc',
          codec: 'vp8',
          appId: appId,
          token: meeting.patient.token,
        };
        setConfig(configurations);
        const createdClient = createClient(configurations);
        setClient(createdClient);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let init = async (meeting) => {
      client.on('user-joined', (user) => {
        // console.log('Joined user: ', user);
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
        setUplink((prev) => prev + stats.uplinkNetworkQuality);
        setDownlink((prev) => prev + stats.downlinkNetworkQuality);

        if (
          stats.downlinkNetworkQuality === 3 ||
          stats.uplinkNetworkQuality === 3
        ) {
          setNotifications({
            msg: 'Poor Network Connectivity',
            duration: 1000,
            position: 'top-right',
          });
        } else if (
          stats.downlinkNetworkQuality === 4 ||
          stats.uplinkNetworkQuality === 4
        ) {
          setNotifications({
            msg: 'Network Connectivity Detoriating',
            duration: 1000,
            position: 'top-right',
          });
        } else if (
          stats.downlinkNetworkQuality === 5 ||
          stats.uplinkNetworkQuality === 5
        ) {
          setNotifications({
            msg: 'Very Poor Connectivity',
            duration: 1000,
            position: 'top-right',
          });
        }
      });

      // End the meeting if token about to expire
      client.on('token-privilege-will-expire', async function () {
        setNotifications({
          msg: 'Meeting about to end',
          duration: 3000,
          position: 'top-right',
        });

        setTimeout(() => setUsers(null), 1000);
        // After requesting a new token
        // await client.renewToken(token);
      });

      // client.on('token-privilege-did-expire', async () => {
      //   setNotifications({
      //     msg: 'Call ended',
      //     duration: 3000,
      //     position: 'top-right',
      //   });
      //   // After requesting a new token
      //   // await client.join(<APPID>, <CHANNEL NAME>, <NEW TOKEN>);
      // });

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

      try {
        await client.join(
          config.appId,
          meeting.channelName,
          config.token,
          meeting.patient.uid
        );
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

      // AgoraRTC.enableLogUpload();
      // AgoraRTC.setLogLevel(0);
    };

    if (ready && tracks && meeting) {
      try {
        init(meeting);
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
          client={client}
          notifications={notifications}
          uplink={uplink}
          downlink={downlink}
        />
      )}
    </div>
  );
}
