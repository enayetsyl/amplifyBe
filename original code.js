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
                client.ws.send(JSON.stringify({ ...message, sender: client.ws.name }));
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
