let socket;
let localStream;
let peerConnections = {};
let roomId;
let name;
let currentBreakoutRoomId = null;

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add TURN server configuration here if needed
    ]
};

const connectSocket = () => {
    socket = new WebSocket('wss://192.168.1.3:3000'); // Replace with your server address

    socket.onmessage = (message) => {
        const data = JSON.parse(message.data);
        console.log('Received message:', data);
        switch (data.type) {
            case 'room-joined':
                handleRoomJoined(data);
                break;
            case 'new-participant':
                handleNewParticipant(data);
                break;
            case 'update-breakout-rooms':
                updateBreakoutRooms(data.breakoutRooms);
                break;
            case 'offer':
                handleOffer(data.offer, data.sender);
                break;
            case 'answer':
                handleAnswer(data.answer, data.sender);
                break;
            case 'ice-candidate':
                handleIceCandidate(data.candidate, data.sender);
                break;
            case 'participant-left':
                removeParticipant(data.name);
                break;
            case 'meeting-ended':
                handleMeetingEnded();
                break;
        }
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed');
    };
};

const joinRoom = async () => {
    roomId = document.getElementById('roomId').value;
    name = document.getElementById('name').value;
    if (roomId && name) {
        document.getElementById('room-selection').style.display = 'none';
        document.getElementById('video-call').style.display = 'block';
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            document.getElementById('localVideo').srcObject = localStream;

            connectSocket();

            socket.onopen = () => {
                socket.send(JSON.stringify({ type: 'join-room', roomId, name }));
            };
        } catch (error) {
            console.error('Error accessing media devices:', error);
            alert('Could not access camera and microphone. Please check permissions.');
        }
    }
};

const handleRoomJoined = (data) => {
    updateRoomHeader(data.roomId, data.isBreakoutRoom);
    updateParticipants(data.participants);
    if (data.isBreakoutRoom) {
        document.getElementById('create-breakout').style.display = 'none';
        document.getElementById('end-meeting').style.display = 'none';
    } else {
        document.getElementById('create-breakout').style.display = 'block';
        document.getElementById('end-meeting').style.display = 'block';
    }
    data.participants.forEach(participant => {
        if (participant.name !== name) {
            createPeerConnection(participant.name);
        }
    });
};

const handleNewParticipant = (data) => {
    console.log('New participant joined:', data.name);
    if (data.name !== name) {
        createPeerConnection(data.name);
    }
};

const createBreakoutRoom = () => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'create-breakout-room', roomId }));
    }
};

const joinBreakoutRoom = (breakoutRoomId) => {
    if (socket.readyState === WebSocket.OPEN) {
        currentBreakoutRoomId = breakoutRoomId;
        // Close existing peer connections
        Object.values(peerConnections).forEach(pc => pc.close());
        peerConnections = {};
        document.getElementById('remoteVideos').innerHTML = '';
        socket.send(JSON.stringify({ type: 'join-breakout-room', roomId, breakoutRoomId, name }));
    }
};

const returnToMainRoom = () => {
    if (socket.readyState === WebSocket.OPEN) {
        currentBreakoutRoomId = null;
        // Close existing peer connections
        Object.values(peerConnections).forEach(pc => pc.close());
        peerConnections = {};
        document.getElementById('remoteVideos').innerHTML = '';
        socket.send(JSON.stringify({ type: 'return-to-main-room', roomId, name }));
    }
};

const endBreakoutRoom = () => {
    if (socket.readyState === WebSocket.OPEN) {
        if (currentBreakoutRoomId) {
            socket.send(JSON.stringify({ type: 'end-breakout-room', roomId, breakoutRoomId: currentBreakoutRoomId }));
            currentBreakoutRoomId = null;
        } else {
            socket.send(JSON.stringify({ type: 'end-breakout-room', roomId }));
        }
    }
};

const endMeeting = () => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'end-meeting', roomId }));
    }
};

const createPeerConnection = (participantName) => {
    if (peerConnections[participantName]) {
        console.log(`Peer connection to ${participantName} already exists`);
        return peerConnections[participantName];
    }
    console.log(`Creating peer connection to ${participantName}`);
    const pc = new RTCPeerConnection(configuration);
    peerConnections[participantName] = pc;

    localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
    });

    pc.onicecandidate = (event) => {
        if (event.candidate) {
            console.log('Sending ICE candidate:', event.candidate);
            socket.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate, roomId, target: participantName }));
        }
    };

    pc.ontrack = (event) => {
        console.log(`Received track from ${participantName}:`, event.track.kind);
        const remoteVideo = document.getElementById(`video-${participantName}`) || document.createElement('video');
        if (!remoteVideo.srcObject) {
            remoteVideo.srcObject = new MediaStream();
        }
        remoteVideo.srcObject.addTrack(event.track);
        remoteVideo.autoplay = true;
        remoteVideo.playsInline = true;
        remoteVideo.id = `video-${participantName}`;

        const container = document.getElementById(`container-${participantName}`) || document.createElement('div');
        container.id = `container-${participantName}`;
        if (!document.getElementById(`container-${participantName}`)) {
            container.appendChild(remoteVideo);
            const nameTag = document.createElement('div');
            nameTag.innerText = participantName;
            container.appendChild(nameTag);
            document.getElementById('remoteVideos').appendChild(container);
        }
    };

    pc.onconnectionstatechange = (event) => {
        console.log('Connection state change:', pc.connectionState);
        if (pc.connectionState === 'failed') {
            console.error('Connection failed for peer:', participantName);
        }
    };

    pc.onnegotiationneeded = () => {
        pc.createOffer().then(offer => {
            return pc.setLocalDescription(offer);
        }).then(() => {
            socket.send(JSON.stringify({
                type: 'offer',
                offer: pc.localDescription,
                roomId,
                target: participantName,
                sender: name
            }));
        }).catch(e => console.error('Error during negotiation:', e));
    };

    return pc;
};

const handleOffer = (offer, sender) => {
    console.log(`Handling offer from ${sender}`);
    const pc = peerConnections[sender] || createPeerConnection(sender);
    pc.setRemoteDescription(new RTCSessionDescription(offer))
        .then(() => pc.createAnswer())
        .then(answer => pc.setLocalDescription(answer))
        .then(() => {
            socket.send(JSON.stringify({
                type: 'answer',
                answer: pc.localDescription,
                roomId,
                target: sender,
                sender: name
            }));
        })
        .catch(e => console.error('Error handling offer:', e));
};

const handleAnswer = (answer, sender) => {
    console.log(`Handling answer from ${sender}`);
    const pc = peerConnections[sender];
    if (pc) {
        pc.setRemoteDescription(new RTCSessionDescription(answer))
            .catch(e => console.error('Error handling answer:', e));
    }
};

const handleIceCandidate = (candidate, sender) => {
    console.log(`Handling ICE candidate from ${sender}`);
    const pc = peerConnections[sender];
    if (pc) {
        pc.addIceCandidate(new RTCIceCandidate(candidate))
            .catch(e => console.error('Error adding ICE candidate:', e));
    }
};

const removeParticipant = (participantName) => {
    if (peerConnections[participantName]) {
        peerConnections[participantName].close();
        delete peerConnections[participantName];
    }
    const videoElement = document.getElementById(`video-${participantName}`);
    if (videoElement) {
        videoElement.srcObject = null;
        videoElement.parentNode.remove();
    }
};

const handleMeetingEnded = () => {
    document.getElementById('video-call').style.display = 'none';
    document.getElementById('room-selection').style.display = 'block';
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
    Object.values(peerConnections).forEach(pc => pc.close());
    peerConnections = {};
    document.getElementById('remoteVideos').innerHTML = '';
    document.getElementById('participants').innerHTML = '';
};

const updateRoomHeader = (roomId, isBreakoutRoom) => {
    const header = document.getElementById('room-header');
    if (isBreakoutRoom) {
        header.textContent = `Breakout Room: ${roomId}`;
    } else {
        header.textContent = `Meeting: ${roomId}`;
    }
};

const updateParticipants = (participants) => {
    console.log('Updating participants:', participants);
    const participantsList = document.getElementById('participants');
    participantsList.innerHTML = '';
    participants.forEach(participant => {
        const listItem = document.createElement('li');
        listItem.textContent = participant.name;
        participantsList.appendChild(listItem);
    });
};

const updateBreakoutRooms = (breakoutRooms) => {
    const breakoutRoomsContainer = document.getElementById('breakout-rooms');
    breakoutRoomsContainer.innerHTML = '';

    breakoutRooms.forEach((breakoutRoomId) => {
        const button = document.createElement('button');
        button.textContent = `Join Breakout Room: ${breakoutRoomId}`;
        button.style.backgroundColor = 'lightyellow';
        button.onclick = () => joinBreakoutRoom(breakoutRoomId);
        breakoutRoomsContainer.appendChild(button);
    });
};
