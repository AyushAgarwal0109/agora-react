import React, { useState } from 'react';
import { getAccessToken } from './apiCalls';
import VideoCall from './VideoCall';

const JoinCall = () => {
  const [inCall, setInCall] = useState(false);
  const [meeting, setMeeting] = useState();
  const [token, setToken] = useState();

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('patient-token', JSON.stringify(token));
      let accessToken = await getAccessToken();
      // console.log(accessToken);
      setMeeting(accessToken);
      setInCall(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {inCall && meeting ? (
        <VideoCall setInCall={setInCall} meeting={meeting} />
      ) : (
        <form>
          <div>
            <label htmlFor='token'>Token</label>
            <input
              type='text'
              name='token'
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>
          <button type='submit' onClick={(e) => handleJoin(e)}>
            Join Call
          </button>
        </form>
      )}
    </>
  );
};

export default JoinCall;
