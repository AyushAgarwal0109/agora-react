import React, { useState, useEffect } from 'react';
import { AgoraVideoPlayer } from 'agora-rtc-react';
import toast, { Toaster, ToastBar } from 'react-hot-toast';
import { leaveChannel, updateStats, getMeetInfo } from './apiCalls.js';

import '../assets/css/Video_UI.css';
import Draggable from 'react-draggable';
import LiveChat from './LiveChat';
import SideNav from './SideNav';

export default function Video(props) {
  const {
    users,
    tracks,
    setStart,
    setInCall,
    client,
    notifications,
    uplink,
    downlink,
  } = props;

  const [trackState, setTrackState] = useState({ video: true, audio: true });
  const [tmpUsers, setTmpUsers] = useState(0);
  const [wasExtended, setWasExtended] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState();
  const [docJoined, setDocJoined] = useState(false);
  const [createdAt, setCreatedAt] = useState();

  // Set meeting information
  useEffect(() => {
    getMeetingInformation();
  }, []);

  // Render notifications
  useEffect(() => {
    if (notifications.msg === 'Meeting about to end') {
      handleLeave(true);
    }
    toast.success(notifications.msg, {
      duration: notifications.duration,
      position: notifications.position,
    });
  }, [notifications]);

  // Timer notifications
  useEffect(() => {
    const now = Date.now() / 1000 - createdAt;
    if (now > 599 && now <= 600) {
      toast.success('5 minutes remaining', {
        duration: 5000,
        position: 'top-right',
      });
    } else if (now > 779 && now <= 780) {
      toast.success('2 minutes remaining', {
        duration: 5000,
        position: 'top-right',
      });
    } else if (now > 899 && now <= 900 && !wasExtended) {
      toast.success('Time over! Meeting about to end', {
        duration: 5000,
        position: 'top-right',
      });
      handleLeave(true);
    } else if (now > 1079 && now <= 1080 && wasExtended) {
      toast.success('Time over! Meeting about to end', {
        duration: 5000,
        position: 'top-right',
      });
      handleLeave(true);
    }
  }, [Date.now()]);

  // Extension notification
  useEffect(() => {
    if (wasExtended) {
      toast.success('3 minutes extended by the doctor', {
        duration: 5000,
        position: 'top-right',
      });
    }
  }, [wasExtended]);

  // Update tmpUsers every time new user joins or leaves
  useEffect(() => {
    getMeetingInformation();
    if (
      meetingInfo &&
      meetingInfo.doctor &&
      !meetingInfo.doctor.inCall &&
      docJoined
    ) {
      setDocJoined(false);
      toast.success('Doctor disconnected from the channel', {
        duration: 3000,
        position: 'top-right',
      });
    } else if (
      meetingInfo &&
      meetingInfo.doctor &&
      meetingInfo.doctor.inCall &&
      !docJoined
    ) {
      setDocJoined(true);
      if (meetingInfo.doctor.disconnections > 0) {
        toast.success('Doctor reconnected to the channel', {
          duration: 3000,
          position: 'top-right',
        });
      } else {
        toast.success('Doctor joined the channel', {
          duration: 3000,
          position: 'top-right',
        });
      }
    }
  }, [users, tmpUsers]);

  // Mute audio/video + notifications
  const mute = async (type) => {
    if (type === 'audio') {
      await tracks[0].setEnabled(!trackState.audio);
      setTrackState((ps) => {
        return { ...ps, audio: !ps.audio };
      });
      toast.success(trackState.audio ? 'Audio turned OFF' : 'Audio turned ON', {
        duration: 1000,
        position: 'top-right',
      });
    } else if (type === 'video') {
      await tracks[1].setEnabled(!trackState.video);
      setTrackState((ps) => {
        return { ...ps, video: !ps.video };
      });
      toast.success(trackState.video ? 'Video turned OFF' : 'Video turned ON', {
        duration: 1000,
        position: 'top-right',
      });
    }
  };

  // Leave the channel
  const handleLeave = async (comm) => {
    if (comm || window.confirm('Are you sure you want to leave the channel?')) {
      const clientStats = client.getRTCStats();
      await updateStats(clientStats, uplink, downlink);
      await leaveChannel();
      await client.leave();

      client.removeAllListeners();
      tracks[0].close();
      tracks[1].close();
      setStart(false);
      setInCall(false);
    }
  };

  // Get meeting information
  const getMeetingInformation = async () => {
    const meetInfo = await getMeetInfo();
    setMeetingInfo(meetInfo.meet);
    setTmpUsers(meetInfo.meet.connectedUsers);
    setWasExtended(meetInfo.meet.wasExtended);
    setCreatedAt(new Date(meetInfo.meet.createdAt).getTime() / 1000);
  };

  // console.log('Users in channel: ', tmpUsers);

  return (
    <div className='app-container'>
      <SideNav />
      <div className='app-main'>
        <div className='video-call-wrapper'>
          {tmpUsers <= 1 ? (
            <div className={'video-participant video-doctor'}>
              <div className='participant-actions' style={{ zIndex: '2' }}>
                <div className='btn-mute'>
                  <i
                    className={
                      trackState.audio
                        ? 'fa-solid fa-microphone'
                        : 'fa-solid fa-microphone-slash'
                    }
                    style={{ color: '#fff' }}
                  ></i>
                </div>
                <div className='btn-camera'>
                  <i
                    className={
                      trackState.video
                        ? 'fa-solid fa-video'
                        : 'fa-solid fa-video-slash'
                    }
                    style={{ color: '#fff' }}
                  ></i>
                </div>
              </div>
              <div className='name-tag' style={{ zIndex: '2' }}>
                {meetingInfo &&
                  meetingInfo.patient &&
                  meetingInfo.patient.uid.name}
              </div>
              <AgoraVideoPlayer
                videoTrack={tracks[1]}
                style={{ height: '100%', width: '100%' }}
              />
            </div>
          ) : (
            <Draggable>
              <div
                className={'video-participant video-patient'}
                style={{ zIndex: '2' }}
              >
                <div className='participant-actions' style={{ zIndex: '2' }}>
                  <div className='btn-mute'>
                    <i
                      className={
                        trackState.audio
                          ? 'fa-solid fa-microphone'
                          : 'fa-solid fa-microphone-slash'
                      }
                      style={{ color: '#fff' }}
                    ></i>
                  </div>
                  <div className='btn-camera'>
                    <i
                      className={
                        trackState.video
                          ? 'fa-solid fa-video'
                          : 'fa-solid fa-video-slash'
                      }
                      style={{ color: '#fff' }}
                    ></i>
                  </div>
                </div>
                <div className='name-tag' style={{ zIndex: '2' }}>
                  {meetingInfo &&
                    meetingInfo.patient &&
                    meetingInfo.patient.uid.name}
                </div>
                <AgoraVideoPlayer
                  videoTrack={tracks[1]}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            </Draggable>
          )}

          {users &&
            users.length > 0 &&
            users.map((user) => {
              if (user.videoTrack || user._videoTrack) {
                return (
                  <div className='video-participant video-doctor'>
                    <div
                      className='participant-actions'
                      style={{ zIndex: '2' }}
                    >
                      <div className='btn-mute'>
                        <i
                          className={
                            !user._audio_muted_
                              ? 'fa-solid fa-microphone'
                              : 'fa-solid fa-microphone-slash'
                          }
                          style={{ color: '#fff' }}
                        ></i>
                      </div>
                      <div className='btn-camera'>
                        <i
                          className={
                            !user._video_muted_
                              ? 'fa-solid fa-video'
                              : 'fa-solid fa-video-slash'
                          }
                          style={{ color: '#fff' }}
                        ></i>
                      </div>
                    </div>
                    <div className='name-tag' style={{ zIndex: '3' }}>
                      {meetingInfo &&
                        meetingInfo.doctor &&
                        meetingInfo.doctor.uid.cardCollections.doctorName}
                    </div>
                    <AgoraVideoPlayer
                      videoTrack={user.videoTrack || user._videoTrack}
                      key={user.uid}
                      style={{ height: '100%', width: '100%' }}
                    />
                  </div>
                );
              } else return null;
            })}
        </div>
        <div className='video-call-actions '>
          <button
            className='video-action-button mic'
            onClick={() => mute('audio')}
          ></button>
          <button
            className='video-action-button camera'
            onClick={() => mute('video')}
          ></button>
          <button
            className='video-action-button endcall'
            onClick={() => handleLeave(false)}
          >
            Leave
          </button>
        </div>
      </div>
      <LiveChat />
      <Toaster
        toastOptions={{
          dismiss: {
            style: {
              border: 'none',
            },
          },
          style: {
            border: 'none',
            padding: '16px',
            color: '#1A936F',
          },
        }}
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ message }) => (
              <>
                {message}
                {t.type !== 'loading' && (
                  <button
                    style={{ border: 'none' }}
                    onClick={() => toast.dismiss(t.id)}
                  >
                    x
                  </button>
                )}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>
    </div>
  );
}
