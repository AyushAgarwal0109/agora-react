import { useState } from 'react';
import VideoCall from './components/VideoCall';

function App() {
  const [inCall, setInCall] = useState(false);

  return (
    <div className='App' style={{ height: '100%' }}>
      {inCall ? (
        <VideoCall setInCall={setInCall} />
      ) : (
        <button onClick={() => setInCall(true)}>Join Call</button>
      )}
    </div>
  );
}

export default App;
