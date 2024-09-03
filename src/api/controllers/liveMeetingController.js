const Chat = require('../models/chatModel');
const Meeting = require('../models/meetingModel');
const LiveMeeting = require('../models/liveMeetingModel');
const { v4: uuidv4 } = require('uuid');
const ChatMessage = require('../models/chatModel');
const { default: mongoose } = require('mongoose');
const { default: axios } = require('axios');

// const startMeeting = async (req, res) => {
//   const { user, meetingId } = req.body;

//   try {
//     // Check if the meeting exists in the Meeting collection
//     const existingMeeting = await Meeting.findById(meetingId);

//     if (!existingMeeting) {
//       return res.status(404).json({ message: "Meeting not found" });
//     }

//     // Check if a LiveMeeting document already exists for this meeting
//     let liveMeeting = await LiveMeeting.findOne({ meetingId: meetingId });

//     if (liveMeeting) {
//       if (liveMeeting.ongoing) {
//         // If the meeting is already ongoing, just return the document
//         return res.status(200).json({ message: "Meeting is already in progress", liveMeeting });
//       } else {
//         // If the meeting exists but is not ongoing, set it to ongoing
//         liveMeeting.ongoing = true;
//         await liveMeeting.save();
//         return res.status(200).json({ message: "Meeting resumed", liveMeeting });
//       }
//     }

//     // Generate a unique ID for the moderator
//     const moderatorId = uuidv4();

//     // If no LiveMeeting document exists, create a new one
//     const newLiveMeeting = new LiveMeeting({
//       meetingId: meetingId,
//       ongoing: true,
//       moderator: {
//         name: `${user.firstName} ${user.lastName}`,
//         id: moderatorId,
//         role: 'Moderator'
//       }
//     });

//     await newLiveMeeting.save();

//     res.status(201).json({ 
//       message: "Live meeting started successfully", 
//       liveMeeting: newLiveMeeting 
//     });

//   } catch (error) {
//     console.error("Error starting meeting:", error);
//     res.status(500).json({ message: "Error starting meeting", error: error.message });
//   }
// };


const startMeeting = async (req, res) => {
  const { user, meetingId } = req.body;

  try {
    // Check if the meeting exists in the Meeting collection
    const existingMeeting = await Meeting.findById(meetingId);

    if (!existingMeeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Call the API to create a room
    let webRtcRoomId = null;
    try {
      const response = await axios.post('https://serverzoom-mpbv.onrender.com/api/create-room');

      if (response.data.roomId) {
        webRtcRoomId = response.data.roomId;
        console.log('create-room api response', response.data.roomId)
      } else {
        return res.status(400).json({ message: "Failed to create room" });
      }
    } catch (error) {
      console.error("Error creating room:", error);
      return res.status(500).json({ message: "Error creating room", error: error.message });
    }

    // Call the API to add the moderator as a user
    try {
      const addUserResponse = await axios.post('https://serverzoom-mpbv.onrender.com/api/addUser', {
        roomId: webRtcRoomId,
        userName: `${user.firstName} ${user.lastName}`
      });

      // console.log('Add user response for moderator', addUserResponse.data.message)
      if (addUserResponse.data.message !== "User added successfully") {
        return res.status(400).json({ message: "Failed to add user" });
      }
    } catch (error) {
      console.error("Error adding user:", error);
      return res.status(500).json({ message: "Error adding user", error: error.message });
    }

    // Check if a LiveMeeting document already exists for this meeting
    let liveMeeting = await LiveMeeting.findOne({ meetingId: meetingId });

    if (liveMeeting) {
      if (liveMeeting.ongoing) {
        // If the meeting is already ongoing, just return the document
        return res.status(200).json({ message: "Meeting is already in progress", liveMeeting });
      } else {
        // If the meeting exists but is not ongoing, set it to ongoing
        liveMeeting.ongoing = true;
        liveMeeting.webRtcRoomId = webRtcRoomId;
        await liveMeeting.save();
        return res.status(200).json({ message: "Meeting resumed", liveMeeting });
      }
    }



    // Generate a unique ID for the moderator
    const moderatorId = uuidv4();

    // If no LiveMeeting document exists, create a new one
    const newLiveMeeting = new LiveMeeting({
      meetingId: meetingId,
      ongoing: true,
      webRtcRoomId: webRtcRoomId,
      moderator: {
        name: `${user.firstName} ${user.lastName}`,
        id: moderatorId,
        role: 'Moderator'
      }
    });

    await newLiveMeeting.save();

    res.status(201).json({
      message: "Live meeting started successfully",
      liveMeeting: newLiveMeeting
    });

  } catch (error) {
    console.error("Error starting meeting:", error);
    res.status(500).json({ message: "Error starting meeting", error: error.message });
  }
};


const joinMeetingParticipant = async (req, res) => {
  const { name, role, meetingId } = req.body;
  console.log(name, role, meetingId);

  try {
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    let liveMeeting = await LiveMeeting.findOne({ meetingId: meetingId });
    if (!liveMeeting) {
      return res.status(404).json({ message: "Live meeting not found" });
    }

    // Check if the participant is already in the waiting room
    const isInWaitingRoom = liveMeeting.waitingRoom.some(participant => participant.name === name);
    if (isInWaitingRoom) {
      return res.status(400).json({ message: "Participant already in waiting room" });
    }

    // Check if the participant is already in the participants list
    const isInParticipantsList = liveMeeting.participantsList.some(participant => participant.name === name);
    if (isInParticipantsList) {
      return res.status(400).json({ message: "Participant already in the meeting" });
    }

    // If not in either list, add to waiting room
    liveMeeting.waitingRoom.push({ name, role });
    await liveMeeting.save();

    res.status(200).json({
      message: "Participant added to waiting room",
      participant: { name, role }
    });

  } catch (error) {
    console.error("Error joining meeting:", error);
    res.status(500).json({ message: "Error joining meeting", error: error.message });
  }
};

const joinMeetingObserver = async (req, res) => {
  const { name, role, passcode, meetingId } = req.body;
  console.log(name, role, passcode, meetingId);

  try {
    // Check if the meeting exists in the Meeting collection
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check if the passcode matches
    if (meeting.meetingPasscode !== passcode) {
      return res.status(401).json({ message: "Invalid passcode" });
    }

    // Find the corresponding LiveMeeting
    let liveMeeting = await LiveMeeting.findOne({ meetingId: meetingId });
    if (!liveMeeting) {
      return res.status(404).json({ message: "Live meeting not found" });
    }

    // Check if the observer is already in the observerList
    const isInObserverList = liveMeeting.observerList.some(observer => observer.name === name);
    if (isInObserverList) {
      return res.status(400).json({ message: "Observer already added to the meeting" });
    }

    // Call the API to add the observer as a user
    // try {
    //   const addUserResponse = await axios.post('https://serverzoom-mpbv.onrender.com/api/addUser', {
    //     roomId: liveMeeting.webRtcRoomId,
    //     userName: name
    //   });

    //   if (addUserResponse.data.message !== "User added successfully") {
    //     return res.status(400).json({ message: "Failed to add user" });
    //   }
    // } catch (error) {
    //   console.error("Error adding user:", error);
    //   return res.status(500).json({ message: "Error adding user", error: error.message });
    // }

    const observerId = uuidv4();

    // Add the observer to the observerList
    liveMeeting.observerList.push({ name, role, id: observerId }); // The id will be generated by the pre-save middleware
    await liveMeeting.save();

    res.status(200).json({
      message: "Observer added to the meeting",
      observer: { name, role }
    });

  } catch (error) {
    console.error("Error joining meeting as observer:", error);
    res.status(500).json({ message: "Error joining meeting as observer", error: error.message });
  }
};

const getWaitingList = async (req, res) => {
  const { meetingId } = req.params;

  try {
    const liveMeeting = await LiveMeeting.findOne({ meetingId });

    if (!liveMeeting) {
      return res.status(404).json({ message: 'Live meeting not found' });
    }

    res.status(200).json({ waitingRoom: liveMeeting.waitingRoom });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving waiting list', error: error.message });
  }
};

// const acceptFromWaitingRoom = async (req, res) => {
//   const { participant, meetingId } = req.body;
//   console.log(participant, meetingId);

//   try {
//     const liveMeeting = await LiveMeeting.findOne({ meetingId });

//     if (!liveMeeting) {
//       return res.status(404).json({ message: 'Live meeting not found' });
//     }

//     const participantIndex = liveMeeting.waitingRoom.findIndex(p => p.name === participant.name);

//     if (participantIndex === -1) {
//       return res.status(404).json({ message: 'Participant not found in waiting room' });
//     }

//     const [removedParticipant] = liveMeeting.waitingRoom.splice(participantIndex, 1);


//     // Add a unique ID to the participant before adding to participantsList
//     const participantWithId = {
//       ...removedParticipant.toObject(),
//       id: uuidv4()
//     };

//     liveMeeting.participantsList.push(participantWithId);

//     await liveMeeting.save();

//     res.status(200).json({ message: 'Participant moved to participants list', updatedLiveMeeting: liveMeeting });
//   } catch (error) {
//     res.status(500).json({ message: 'Error accepting participant from waiting room', error: error.message });
//   }
// };

const acceptFromWaitingRoom = async (req, res) => {
  const { participant, meetingId } = req.body;
  console.log(participant, meetingId);

  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const liveMeeting = await LiveMeeting.findOne({ meetingId }).session(session);

    if (!liveMeeting) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Live meeting not found' });
    }

    const participantIndex = liveMeeting.waitingRoom.findIndex(p => p.name === participant.name);

    if (participantIndex === -1) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Participant not found in waiting room' });
    }

    const [removedParticipant] = liveMeeting.waitingRoom.splice(participantIndex, 1);

    // Add the participant to the WebRTC room before saving to the database
    try {
      const addUserResponse = await axios.post('https://serverzoom-mpbv.onrender.com/api/addUser', {
        roomId: liveMeeting.webRtcRoomId,
        userName: participant.name
      });

      // console.log("Add participant response:", addUserResponse.data.message);
      if (addUserResponse.data.message !== "User added successfully") {
        // If adding the user to the WebRTC room fails, rollback the transaction
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Failed to add user to WebRTC room" });
      }
    } catch (error) {
      console.error("Error adding user to WebRTC room:", error);
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ message: "Error adding user to WebRTC room", error: error.message });
    }

    // Add a unique ID to the participant before adding to participantsList
    const participantWithId = {
      ...removedParticipant.toObject(),
      id: uuidv4()
    };

    liveMeeting.participantsList.push(participantWithId);

    // Save the changes to the database
    await liveMeeting.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: 'Participant moved to participants list', updatedLiveMeeting: liveMeeting });
  } catch (error) {
    console.error("Error accepting participant from waiting room:", error);
    // If any error occurs, abort the transaction and rollback any changes
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Error accepting participant from waiting room', error: error.message });
  }
};

const getParticipantList = async (req, res) => {
  const { meetingId } = req.params;

  try {
    const liveMeeting = await LiveMeeting.findOne({ meetingId });

    if (!liveMeeting) {
      return res.status(404).json({ message: 'Live meeting not found' });
    }

    // Create a new array with moderator and participants
    const fullParticipantList = [
      liveMeeting.moderator,
      ...liveMeeting.participantsList
    ];

    res.status(200).json({ participantsList: fullParticipantList });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving participant list', error: error.message });
  }
};

const getObserverList = async (req, res) => {
  const { meetingId } = req.params;

  try {
    const liveMeeting = await LiveMeeting.findOne({ meetingId });

    if (!liveMeeting) {
      return res.status(404).json({ message: 'Live meeting not found' });
    }

    // Create a new array with moderator and observers
    const fullObserverList = [
      liveMeeting.moderator,
      ...liveMeeting.observerList
    ];

    res.status(200).json({ observersList: fullObserverList });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving observer list', error: error.message });
  }
};

const getMeetingStatus = async (req, res) => {
  const { meetingId } = req.params;
  try {
    const liveMeeting = await LiveMeeting.findOne({ meetingId });

    if (!liveMeeting) {
      return res.status(404).json({ message: 'Live meeting not found' });
    }

    res.status(200).json({ meetingStatus: liveMeeting.ongoing });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving observer list', error: error.message });
  }
}

const participantSendMessage = async (req, res) => {
  const { message, meetingId } = req.body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const liveMeeting = await LiveMeeting.findOne({ meetingId }).session(session);

    if (!liveMeeting) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Live meeting not found' });
    }

    // Create a new ChatMessage document
    const newChatMessage = new ChatMessage({
      senderName: message.senderName,
      receiverName: message.receiverName,
      message: message.message,
    });

    // Save the new chat message
    const savedChatMessage = await newChatMessage.save({ session });

    // Add the saved chat message's ID to the liveMeeting's participantChat array
    liveMeeting.participantChat.push(savedChatMessage._id);
    await liveMeeting.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Fetch the updated participantChat with populated messages
    const updatedLiveMeeting = await LiveMeeting.findOne({ meetingId }).populate('participantChat');

    res.status(200).json({
      message: 'Chat message saved successfully',
      participantMessages: updatedLiveMeeting.participantChat
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error saving participant chat:", error);
    res.status(500).json({ message: 'Error saving participant chat', error: error.message });
  }
}

const getParticipantChat = async (req, res) => {
  const { meetingId } = req.params;
  try {
    const liveMeeting = await LiveMeeting.findOne({ meetingId }).populate('participantChat');

    if (!liveMeeting) {
      return res.status(404).json({ message: 'Live meeting not found' });
    }

    if (!liveMeeting.participantChat || liveMeeting.participantChat.length === 0) {
      return res.status(404).json({ message: 'No chat messages found for this meeting' });
    }

    res.status(200).json({
      message: 'Participant chat retrieved successfully',
      participantMessages: liveMeeting.participantChat
    });

  } catch (error) {
    console.error("Error retrieving participant chat:", error);
    res.status(500).json({ message: 'Error retrieving participant chat', error: error.message });
  }
}
const getObserverChat = async (req, res) => {
  const { meetingId } = req.params;
  try {
    const liveMeeting = await LiveMeeting.findOne({ meetingId }).populate('observerChat');

    if (!liveMeeting) {
      return res.status(404).json({ message: 'Live meeting not found' });
    }

    if (!liveMeeting.observerChat || liveMeeting.observerChat.length === 0) {
      return res.status(404).json({ message: 'No chat messages found for this meeting' });
    }
    res.status(200).json({
      message: 'Observers chat retrieved successfully',
      observersMessages: liveMeeting.observerChat
    });

  } catch (error) {
    console.error("Error retrieving observers chat:", error);
    res.status(500).json({ message: 'Error retrieving observers chat', error: error.message });
  }
}

const observerSendMessage = async (req, res) => {
  const { message, meetingId } = req.body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const liveMeeting = await LiveMeeting.findOne({ meetingId }).session(session);

    if (!liveMeeting) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Live meeting not found' });
    }

    // Create a new ChatMessage document
    const newChatMessage = new ChatMessage({
      senderName: message.senderName,
      receiverName: message.receiverName,
      message: message.message,
    });

    // Save the new chat message
    const savedChatMessage = await newChatMessage.save({ session });

    // Add the saved chat message's ID to the liveMeeting's observerChat array

    liveMeeting.observerChat.push(savedChatMessage._id);
    await liveMeeting.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Fetch the updated observerChat with populated messages
    const updatedLiveMeeting = await LiveMeeting.findOne({ meetingId }).populate('observerChat');

    res.status(200).json({
      message: 'Chat message saved successfully',
      observersMessages: updatedLiveMeeting.observerChat
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error saving participant chat:", error);
    res.status(500).json({ message: 'Error saving participant chat', error: error.message });
  }
}

// const removeParticipantFromMeeting = async(req, res) => {
//   const { meetingId, name, role } = req.body;
//   try {
//     const liveMeeting = await LiveMeeting.findOne({ meetingId });

//     if (!liveMeeting) {
//       return res.status(404).json({ message: "Live meeting not found" });
//     }

//     if (role === 'Participant') {
//       liveMeeting.waitingRoom = liveMeeting.waitingRoom.filter(participant => participant.name !== name);
//       liveMeeting.participantsList = liveMeeting.participantsList.filter(participant => participant.name !== name);
//     } else if (role === 'Observer') {
//       liveMeeting.observerList = liveMeeting.observerList.filter(observer => observer.name !== name);
//     } else {
//       return res.status(400).json({ message: "Invalid role provided" });
//     }

//     await liveMeeting.save();

//     res.status(200).json({ message: "Participant removed successfully" });
//   } catch (error) {
//     console.error("Error removing participant:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }


const removeParticipantFromMeeting = async (req, res) => {
  const { meetingId, name, role } = req.body;
  try {
    const liveMeeting = await LiveMeeting.findOne({ meetingId });

    if (!liveMeeting) {
      return res.status(404).json({ message: "Live meeting not found" });
    }



    if (role === 'Participant') {
      const initialParticipantsLength = liveMeeting.participantsList.length;

      liveMeeting.waitingRoom = liveMeeting.waitingRoom.filter(participant => participant.name !== name);

      liveMeeting.participantsList = liveMeeting.participantsList.filter(participant => participant.name !== name);

      // Check if the participant was in the participantsList and needs to be removed from WebRTC room
      if (liveMeeting.participantsList.length < initialParticipantsLength) {
        const response = await axios.post('https://serverzoom-mpbv.onrender.com/api/removeUser', {
          roomId: liveMeeting.webRtcRoomId,
          userName: name
        });
        console.log('participant remove response', response.data);
      }
    } else if (role === 'Observer') {
      liveMeeting.observerList = liveMeeting.observerList.filter(observer => observer.name !== name);

      // const response = await axios.post('https://serverzoom-mpbv.onrender.com/api/removeUser', {
      //   roomId: liveMeeting.webRtcRoomId,
      //   userName: name
      // });

      // console.log('observer remove response', response.data);

    } else {
      return res.status(400).json({ message: "Invalid role provided" });
    }

    await liveMeeting.save();

    res.status(200).json({ message: "Participant removed successfully" });
  } catch (error) {
    console.error("Error removing participant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getWebRtcMeetingId = async (req, res) => {
  const { meetingId } = req.params;
  console.log('meetingId', meetingId);

  try {
    const liveMeeting = await LiveMeeting.findOne({ meetingId });

    if (!liveMeeting) {
      return res.status(404).json({ message: "Live meeting not found" });
    }

    if (liveMeeting.webRtcRoomId) {
      res.status(200).json({ webRtcRoomId: liveMeeting.webRtcRoomId });
    } else {
      res.status(404).json({ message: "WebRTC room ID not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}


module.exports = {
  startMeeting, joinMeetingParticipant, joinMeetingObserver, getWaitingList, acceptFromWaitingRoom, getParticipantList, getObserverList, getMeetingStatus, participantSendMessage, getParticipantChat, getObserverChat, observerSendMessage, removeParticipantFromMeeting, getWebRtcMeetingId
}