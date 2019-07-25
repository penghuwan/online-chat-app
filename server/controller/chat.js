const DEFAULT_ROOM = 'DEFAULT_ROOM';
// 这里后面优化可以改为用redis存储这些即时通信数据
let mems = [];
const memInfoMap = {}; // 储存 socketId 到昵称的映射
function handleJoinRoom(socket, { newMem }, cb) {
    mems.push(socket.id);
    memInfoMap[socket.id] = newMem;
    mems = mems.map(m => memInfoMap[m]);
    cb(mems);
    // 加入聊天室
    socket.join(DEFAULT_ROOM, () => {
        // 通知聊天室里的其他人,新成员加入
        socket.to(DEFAULT_ROOM).emit('other-join-room', {
            newMem
        })
    })
}

function handleMessage(socket, { nickname, word }, callback, db) {
    // 通知聊天室里的其他人,有新消息发送
    socket.to(DEFAULT_ROOM).emit('other-send-message', {
        nickname,
        word
    });
    db.execute('INSERT INTO chat_record (nickname, word) VALUE (?,?)', [nickname, word]);
    // 调用前端的回调函数
    callback();
}

// 用户下线
function handleOffline(socket) {
    const leaveMem = memInfoMap[socket.id];
    socket.to(DEFAULT_ROOM).emit('other-leave-room', {
        mem: leaveMem
    });
    socket.leave(DEFAULT_ROOM)
    const i = mems.indexOf(socket.id);
    mems.splice(i, 1);
    delete memInfoMap[socket.id];
}

module.exports = {
    handleJoinRoom,
    handleMessage,
    handleOffline
}