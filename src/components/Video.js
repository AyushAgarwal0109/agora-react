import React, { useState, useEffect } from 'react';
import { AgoraVideoPlayer, createClient } from 'agora-rtc-react';
import toast, { Toaster, ToastBar } from 'react-hot-toast';

import '../assets/css/Video_UI.css';
import Draggable from 'react-draggable';
import LiveChat from './LiveChat';

export default function Video(props) {
  const { users, tracks, setStart, setInCall, config, notifications } = props;

  // Control buttons functionality
  const [trackState, setTrackState] = useState({ video: true, audio: true });
  const [client, setClient] = useState();
  const [joinedUsers, setJoinedUsers] = useState(users);

  useEffect(() => {
    let createdClient = createClient(config);
    setClient(createdClient);
  }, []);

  // Render notifications
  useEffect(() => {
    toast.success(notifications.msg, {
      duration: notifications.duration,
      position: notifications.position,
    });
  }, [notifications]);

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
  const leaveChannel = async () => {
    await client.leave();
    client.removeAllListeners();
    tracks[0].close();
    tracks[1].close();
    setStart(false);
    setInCall(false);
    toast.success('Left the channel', {
      duration: 3000,
      position: 'top-right',
    });
  };

  return (
    <div className='app-container'>
      <div className='left-side'>
        <div className='navigation'>
          <a href='/' className='nav-link icon'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='feather feather-home'
              viewBox='0 0 24 24'
            >
              <path d='M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' />
              <path d='M9 22V12h6v10' />
            </svg>
          </a>
          <a href='/' className='nav-link icon'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='feather feather-message-square'
            >
              <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
            </svg>
          </a>
          <a href='/' className='nav-link icon'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='feather feather-phone-call'
              viewBox='0 0 24 24'
            >
              <path d='M15.05 5A5 5 0 0119 8.95M15.05 1A9 9 0 0123 8.94m-1 7.98v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z' />
            </svg>
          </a>
          <a href='/' className='nav-link icon'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='feather feather-hard-drive'
            >
              <line x1='22' y1='12' x2='2' y2='12' />
              <path d='M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z' />
              <line x1='6' y1='16' x2='6.01' y2='16' />
              <line x1='10' y1='16' x2='10.01' y2='16' />
            </svg>
          </a>
          <a href='/' className='nav-link icon'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='feather feather-users'
            >
              <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
              <circle cx='9' cy='7' r='4' />
              <path d='M23 21v-2a4 4 0 0 0-3-3.87' />
              <path d='M16 3.13a4 4 0 0 1 0 7.75' />
            </svg>
          </a>
          <a href='/' className='nav-link icon'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='feather feather-folder'
              viewBox='0 0 24 24'
            >
              <path d='M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z' />
            </svg>
          </a>
          <a href='/' className='nav-link icon'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='feather feather-settings'
              viewBox='0 0 24 24'
            >
              <circle cx='12' cy='12' r='3' />
              <path d='M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z' />
            </svg>
          </a>
        </div>
      </div>
      <div className='app-main'>
        <div className='video-call-wrapper'>
          <div className='video-participant video-doctor'>
            <div className='participant-actions'>
              <button className='btn-mute'></button>
              <button className='btn-camera'></button>
            </div>
            <a href='/' className='name-tag'>
              Dr. Swapnil Katare
            </a>
            <AgoraVideoPlayer
              videoTrack={tracks[1]}
              style={{ height: '100%', width: '100%' }}
            />
          </div>
          <Draggable style={{ zIndex: '2' }}>
            <div className='video-participant video-patient'>
              {console.log('Users:-', joinedUsers)}
              {joinedUsers &&
                joinedUsers.length > 0 &&
                joinedUsers.map((user) => {
                  if (user.videoTrack) {
                    return (
                      <>
                        <div className='participant-actions'>
                          <button className='btn-mute'></button>
                          <button className='btn-camera'></button>
                        </div>
                        <a href='/' className='name-tag'>
                          Ayush Agarwal
                        </a>
                        <AgoraVideoPlayer
                          videoTrack={user.videoTrack}
                          key={user.uid}
                          style={{ height: '100%', width: '100%' }}
                        />
                      </>
                    );
                  } else return null;
                })}
            </div>
          </Draggable>
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
            onClick={() => leaveChannel()}
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
