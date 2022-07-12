import { useState } from 'react';
import VideoCall from './components/VideoCall';

function App() {
  const [inCall, setInCall] = useState(false);
  const [token, setToken] = useState();
  const [channel, setChannel] = useState();

  return (
    <div className='App' style={{ height: '100%' }}>
      {inCall ? (
        <VideoCall setInCall={setInCall} token={token} channel={channel} />
      ) : (
        <>
          <form>
            <div>
              <label htmlFor='token'>Token</label>
              <input
                type='text'
                name='token'
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor='token'>Channel Name</label>
              <input
                type='text'
                name='channel'
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              />
            </div>
            <button type='submit' onClick={() => setInCall(true)}>
              Join Call
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default App;
