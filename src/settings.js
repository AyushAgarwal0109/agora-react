import { createClient, createMicrophoneAndCameraTracks } from 'agora-rtc-react';

const appId = '65b90aaaa55941c98656335b181c00db';
const token =
  '00665b90aaaa55941c98656335b181c00dbIAAPaGHyFjX22QpM6ny5xgXfZge9t/fc/1t+kNK9MHMKf+GBAh9ruFwpIgA9yDX/WlLJYgQAAQCKBchiAgCKBchiAwCKBchiBACKBchi';
export const config = { mode: 'rtc', codec: 'vp8', appId: appId, token: token };
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = 'Kc658eN';
export const uid = '61ec3cca87929b00249367f3';
