// Connect to the socket
const socket = io.connect('http://127.0.0.1:5000')

console.log('test')

socket.on('connect', () => {
    socket.emit('join_room', {
        username: username,
        room: room,
        pfp: pfp
    });
});


// Send new message to the server
const newmsg = document.getElementById('msg-input');
const sendbutton = document.getElementById('send-button');
sendbutton.onclick = () => {
    if(newmsg.value.trim().length > 0){
        socket.emit('send_message', {
            username: username,
            room: room,
            message: newmsg.value
        });

        // Reset input value after sending the message
        newmsg.value = '';
        newmsg.focus();
    }
}


const msglist = document.getElementById('msg-list');
function createMessage(data){
    let li = document.createElement('li');
    let span = document.createElement('span');
    span.classList = 'message-name';
    // If message is send by the client, show message on right with 'you' instead of username
    if(data['username'] == username){
        li.classList = 'bubble yours'
        span.textContent = 'You';
    }else{
        li.classList = 'bubble'
        span.textContent = data['username'];
    }
    li.appendChild(span);
    li.appendChild(document.createTextNode(data['message']));
    msglist.appendChild(li);
}


// Generate messages from history
let allmessages = JSON.parse(messages);
for (let i = 0; i < allmessages.length; i++) {
    const newmessage = allmessages[i];
    createMessage(newmessage);
}


// Receive new message
socket.on('receive_message', (data) => {
    createMessage(data);
});


// Change user status text
function changeStatus(user, status){
    for (var i = 0; i < user.childNodes.length; i++) {
        if (user.childNodes[i].className == "status"){
            console.log(status)
            user.childNodes[i].textContent = status;
            break;
        }
    }
}


// Append user dom object to the room list if doesn't exist, if exists change status to connected
const userlist = document.getElementById('userlist');
function addUserToList(data, status){

    let connected = (status) ? '' : 'disconnected';

    let connectedval;
    if(connected.length > 0){
        connectedval = 'Disconnected';
    }else{
        connectedval = 'Connected';
    }
    
    let newuser = `<li class="flex-row ${connected}" id="${data['username']}"">
                        <div class="pfp" style="background-image: url('/static/styles/media/${data['pfp']}.png')"></div>
                        <div class="user-info">
                            <div class="flex-row user-id">
                                <span class="name">${data['username']}</span>
                                <span class="number">#01</span>
                            </div>
                            <span class="status flex-row"><div class="dot"></div>
                                ${connectedval}
                            </span>
                        </div>
                    </li>`
    userlist.insertAdjacentHTML('beforeend', newuser);
}


// Generate user list
let allusers = JSON.parse(users);
for (let i = 0; i < allusers.length; i++) {
    const userdata = allusers[i];
    addUserToList(userdata, userdata['connected']);
}


// Add user to the room list
socket.on('join_room_add_user', (data) => {
    let user = document.getElementById(data['username']);
    if(user == null){
        addUserToList(data, true)
    }
    else{
        user.classList.remove('disconnected');
        changeStatus(user, 'Connected');
    }
});


// Remove user from the list if disconnected
socket.on('leave_room_remove_user', (data) => {
    const user = document.getElementById(data['username']);
    user.classList.add('disconnected');
    changeStatus(user, 'Disconnected');
});


// Leave room
const leavebutton = document.getElementById('btn-leave');
leavebutton.onclick = () => {
    socket.emit('leave_room', {
            username: username,
            room: room
    });
    window.location = "/";
}
