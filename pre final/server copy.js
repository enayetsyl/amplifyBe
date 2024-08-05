const express = require('express');
const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}, app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

let rooms = {};

const getParticipants = (roomId, parentRoomId = null) => {
    if (parentRoomId) {
        return rooms[parentRoomId]?.breakoutRooms[roomId]?.clients.map(client => ({
            name: client.name,
            id: client.ws._socket.remoteAddress
        })) || [];
    }
    return rooms[roomId]?.clients.map(client => ({
        name: client.name,
        id: client.ws._socket.remoteAddress
    })) || [];
};

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        switch (data.type) {
            case 'join-room':
                if (!rooms[data.roomId]) {
                    rooms[data.roomId] = { clients: [], breakoutRooms: {} };
                }
                if (!rooms[data.roomId].clients.some(client => client.ws === ws)) {
                    rooms[data.roomId].clients.push({ ws, name: data.name });
                }
                ws.roomId = data.roomId;
                ws.name = data.name;
                broadcast(data.roomId, {
                    type: 'room-joined',
                    roomId: data.roomId,
                    participants: getParticipants(data.roomId)
                });
                rooms[data.roomId].clients.forEach(client => {
                    if (client.ws !== ws) {
                        client.ws.send(JSON.stringify({
                            type: 'new-participant',
                            name: data.name
                        }));
                    }
                });
                sendBreakoutRoomsList(data.roomId);
                break;
            case 'create-breakout-room':
                if (!rooms[data.roomId]) {
                    rooms[data.roomId] = { clients: [], breakoutRooms: {} };
                }
                const breakoutRoomId = `${data.roomId}-breakout-${Date.now()}`;
                rooms[data.roomId].breakoutRooms[breakoutRoomId] = { clients: [] };
                broadcast(data.roomId, { type: 'breakout-room-created', breakoutRoomId });
                sendBreakoutRoomsList(data.roomId);
                break;
            case 'join-breakout-room':
                if (rooms[data.roomId] && rooms[data.roomId].breakoutRooms[data.breakoutRoomId]) {
                    removeParticipantFromCurrentRoom(ws);
                    rooms[data.roomId].breakoutRooms[data.breakoutRoomId].clients.push({ ws, name: data.name });
                    ws.breakoutRoomId = data.breakoutRoomId;
                    ws.send(JSON.stringify({ type: 'room-joined', roomId: data.breakoutRoomId, isBreakoutRoom: true, participants: getParticipants(data.breakoutRoomId, data.roomId) }));
                    sendBreakoutRoomsList(data.roomId);
                }
                break;
            case 'end-breakout-room':
                if (rooms[data.roomId]) {
                    if (data.breakoutRoomId) {
                        endSpecificBreakoutRoom(data.roomId, data.breakoutRoomId);
                    } else {
                        for (const breakoutRoomId of Object.keys(rooms[data.roomId].breakoutRooms)) {
                            endSpecificBreakoutRoom(data.roomId, breakoutRoomId);
                        }
                    }
                }
                break;
            case 'end-meeting':
                if (rooms[data.roomId]) {
                    const room = rooms[data.roomId];
                    room.clients.forEach((client) => {
                        client.ws.send(JSON.stringify({ type: 'meeting-ended' }));
                        client.ws.close();
                    });
                    delete rooms[data.roomId];
                }
                break;
            case 'offer':
            case 'answer':
            case 'ice-candidate':
                sendTo(data.target, data);
                break;
        }
    });

    ws.on('close', () => {
        if (!rooms[ws.roomId]) return;
        const room = rooms[ws.roomId];
        room.clients = room.clients.filter((client) => client.ws !== ws);
        if (ws.breakoutRoomId) {
            const breakoutRoom = room.breakoutRooms[ws.breakoutRoomId];
            if (breakoutRoom) {
                breakoutRoom.clients = breakoutRoom.clients.filter((client) => client.ws !== ws);
            }
        }
        sendBreakoutRoomsList(ws.roomId);
    });
});

const sendTo = (target, message) => {
    for (const roomId in rooms) {
        const room = rooms[roomId];
        room.clients.forEach((client) => {
            if (client.ws.name === target) {
                client.ws.send(JSON.stringify(message));
            }
        });
    }
};

const broadcast = (roomId, data) => {
    const clients = rooms[roomId]?.clients || [];
    clients.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(data));
        }
    });
};
let socket;
let localStream;
let peerConnections = {};
let roomId;
let name;
let currentBreakoutRoomId = null;

const configuration = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        }
    ]
};

const connectSocket = () => {
    socket = new WebSocket('wss://192.168.1.3:3000'); // Replace with your IP address

    socket.onmessage = (message) => {
        const data = JSON.parse(message.data);
        console.log('Received message:', data);
        switch (data.type) {
            case 'room-joined':
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
                break;
            case 'new-participant':
                console.log('New participant joined:', data.name);
                if (data.name !== name) {
                    createPeerConnection(data.name);
                }
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
            socket.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate, roomId, target: participantName }));
        }
    };

    pc.ontrack = (event) => {
        console.log(`Received track from ${participantName}`);
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


const removeParticipantFromCurrentRoom = (ws) => {
    const room = rooms[ws.roomId];
    if (room) {
        room.clients = room.clients.filter(client => client.ws !== ws);
        if (ws.breakoutRoomId) {
            const breakoutRoom = room.breakoutRooms[ws.breakoutRoomId];
            if (breakoutRoom) {
                breakoutRoom.clients = breakoutRoom.clients.filter(client => client.ws !== ws);
            }
        }
    }
};

const sendBreakoutRoomsList = (roomId) => {
    const breakoutRooms = Object.keys(rooms[roomId]?.breakoutRooms || {});
    rooms[roomId].clients.forEach(client => {
        client.ws.send(JSON.stringify({ type: 'update-breakout-rooms', breakoutRooms }));
    });
};

const endSpecificBreakoutRoom = (roomId, breakoutRoomId) => {
    const breakoutRoom = rooms[roomId].breakoutRooms[breakoutRoomId];
    if (breakoutRoom) {
        breakoutRoom.clients.forEach((client) => {
            client.breakoutRoomId = null;
            rooms[roomId].clients.push(client);
            client.ws.send(JSON.stringify({ type: 'room-joined', roomId: roomId, participants: getParticipants(roomId) }));
        });
        delete rooms[roomId].breakoutRooms[breakoutRoomId];
    }
    sendBreakoutRoomsList(roomId);
};

server.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on port 3000');
});
