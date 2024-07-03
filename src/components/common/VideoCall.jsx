import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const VideoCall = () => {
  const [input, setInput] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);  // State to track socket connection
  const [remoteConnected, setRemoteConnected] = useState(false);  // State to track remote user connection
  const peer = useRef();
  const localStream = useRef();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const { currentUser } = useAuth();
  const location = useLocation();
  const userId = location.state?.userId;

  useEffect(() => {
    // Initialize a new Peer instance with options
    peer.current = new Peer(currentUser.uid, {
      host: 'vc-backend-l30g.onrender.com',
      path: '/myapp',
      debug: 3,
    });

    // Event listener for Peer open event
    peer.current.on('open', (id) => {
      console.log('My peer ID is: ' + id);
      // Once PeerJS connection is open, get user media
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          localStream.current = stream;
          // Display local video
          if (!localVideoRef.current) {
            const localVideo = document.createElement('video');
            localVideo.srcObject = stream;
            localVideo.autoplay = true;
            localVideo.muted = true; // Mute local video to avoid feedback loop
            document.getElementById('localVideoContainer').appendChild(localVideo);
            localVideoRef.current = localVideo;
          }

          // Listen for incoming connections
          peer.current.on('connection', handleIncomingConnection);
          peer.current.on('call', handleIncomingCall);

          // Set socket connected state to true
          setSocketConnected(true);
        })
        .catch(err => {
          console.error('Error accessing media devices:', err);
        });
    });

    // Cleanup on unmount
    return () => {
      peer.current.destroy();
    };
  }, [currentUser.uid]);

  // Function to handle incoming connections
  const handleIncomingConnection = (incomingConnection) => {
    incomingConnection.on('data', (data) => {
      console.log('Received data:', data);
    });

    incomingConnection.on('close', () => {
      console.log('Connection closed');
    });
  };

  // Function to handle incoming calls
  const handleIncomingCall = (call) => {
    call.answer(localStream.current); // Answer the call with local stream
    call.on('stream', (remoteStream) => {
      // Display remote video
      if (!remoteVideoRef.current) {
        const remoteVideo = document.createElement('video');
        remoteVideo.srcObject = remoteStream;
        remoteVideo.autoplay = true;
        document.getElementById('remoteVideoContainer').appendChild(remoteVideo);
        remoteVideoRef.current = remoteVideo;
      }
      setRemoteConnected(true);  // Set remote connected state to true
    });
  };

  // Function to connect to a remote peer (by Peer ID)
  const connectToPeer = (remotePeerId) => {
    if (!remotePeerId) return; // Ensure remotePeerId is provided

    const connection = peer.current.connect(remotePeerId);

    connection.on('open', () => {
      connection.send('Hello from PeerJS!');
    });

    // Handle incoming stream from the remote peer
    const call = peer.current.call(remotePeerId, localStream.current);
    call.on('stream', (remoteStream) => {
      // Display remote video
      if (!remoteVideoRef.current) {
        const remoteVideo = document.createElement('video');
        remoteVideo.srcObject = remoteStream;
        remoteVideo.autoplay = true;
        document.getElementById('remoteVideoContainer').appendChild(remoteVideo);
        remoteVideoRef.current = remoteVideo;
      }
      setRemoteConnected(true);  // Set remote connected state to true
    });
  };

  // Effect to connect to peer when socket is connected and userId is available
  useEffect(() => {
    if (socketConnected && userId) {
      connectToPeer(userId);
    }
  }, [socketConnected, userId]);

  return (
    <div>
      <h2>Accountable Video Call</h2>
      <div style={{display: 'flex', width: '100%'}}>
        <div id='localVideoContainer' style={{ flex: 1 }}></div>
        <div id='remoteVideoContainer' style={{ flex: 1 }}>
          {!remoteConnected && <p>Waiting for remote user to join...</p>}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
