const mongoose = require('mongoose');

const userRoleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    CanScreenshare: { type: Boolean, default: false },
    CanManagerMuteForAll: { type: Boolean, default: false },
    CanManagerCameraForAll: { type: Boolean, default: false },
    ShowToAll: { type: Boolean, default: false },
    CanTalk: { type: Boolean, default: false }
});

module.exports = mongoose.model('UserRoleMeet', userRoleSchema);
