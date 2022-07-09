import { useState, useEffect } from 'react';
import { useMicrophoneAndCameraTracks } from './settings.js';
import Video from './Video';
import { getAccessToken } from './getAccessToken.js';
import { createClient } from 'agora-rtc-react';

export default function VideoCall(props) {
  const { setInCall } = props;
  const [users, setUsers] = useState([]);
  const [start, setStart] = useState(false);
  const { ready, tracks } = useMicrophoneAndCameraTracks();
  const [config, setConfig] = useState();
  const [channelName, setChannelName] = useState();
  const [patientUid, setPatientUid] = useState();
  const [client, setClient] = useState();

  useEffect(() => {
    setLocalState();
  }, []);

  const setLocalState = async () => {
    let tokenDetails = await getAccessToken();
    console.log(tokenDetails);
    if (tokenDetails) {
      setChannelName(tokenDetails.channel_name);
      setPatientUid(tokenDetails.patient_uid);
      const configurations = {
        mode: 'rtc',
        codec: 'vp8',
        appId: tokenDetails.app_id,
        token: tokenDetails.token_patient,
      };
      setConfig(configurations);
      const createdClient = createClient(configurations);
      setClient(createdClient);
    }
  };

  useEffect(() => {
    let init = async (name) => {
      if (client && config) {
        console.log(config.appId, name, config.token, patientUid);
        console.log('Tracks', tracks);
        try {
          await client.join(config.appId, name, config.token, patientUid);
        } catch (error) {
          console.log('error');
        }

        if (tracks) await client.publish([tracks[0], tracks[1]]);
        setStart(true);

        client.on('user-published', (user, mediaType) => {
          console.log('here');

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
            user.audioTrack.play();
          }
        });

        client.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'audio') {
            if (user.audioTrack) user.audioTrack.stop();
          }
          if (mediaType === 'video') {
            setUsers((prevUsers) => {
              return prevUsers.filter((User) => User.uid !== user.uid);
            });
          }
        });

        client.on('user-left', (user) => {
          setUsers((prevUsers) => {
            return prevUsers.filter((User) => User.uid !== user.uid);
          });
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
        />
      )}
    </div>
  );
}
