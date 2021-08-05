const participants = [];

//Adding participant
addParticipant = (id, username, fullName, profilePic, ipAddress, room) => {
    const participant = { 
        id,
        username, 
        fullName, 
        profilePic, 
        ipAddress,
        room
    };
    participants.push(participant);
    return participant;
}

//Getting participants already in the group from id
getCurrentParticipant = (id) => {
    return participants.find(participant => participant.id === id);
}

//Participant leaving
participantLeave = (id) => {
    const index = participants.findIndex(participant => participant.id === id);
    if (index !== -1) {
      return participants.splice(index, 1)[0];
    }
}
  
//Getting participants already in the group from room
getRoomParticipants = (room) => {
    return participants.filter(participant => participant.room === room);
}

module.exports = {
    addParticipant,
    getCurrentParticipant,
    participantLeave,
    getRoomParticipants
};