from flask import Flask, render_template, request, redirect, url_for
from flask_socketio import SocketIO, join_room, leave_room
from db import saveUser, findUser, updateUserStatus, getAllUsersInRoom, getAllMessages, addMessage
import random

app = Flask(__name__)
socketio = SocketIO(app)
socketio.init_app(app, cors_allowed_origins="*")

@app.route('/')
def home():
    return render_template('home.html')

# Log in into chat
@app.route('/chat')
def chat():
    username = request.args.get('username')
    room = request.args.get('room')
    allUsers = getAllUsersInRoom(room)
    allMessages = getAllMessages(room)
    pfp = random.randrange(1, 5)

    if username and room:
        # Save new user or change its status to 'connected' if exists
        if(findUser(username, room) == 0):
            saveUser(username, room, pfp)
        else:
            updateUserStatus(username, room, True)

        return render_template('chat.html', username=username, room=room, pfp=pfp, users=allUsers, messages=allMessages)
    else:
        return redirect(url_for('home'))

@socketio.on('join_room')
def handle_join_room(data):
    app.logger.info("{} has joined the room {}".format(data['username'], data['room']))
    join_room(data['room'])
    # Emit event to the client so new user can be displayed on the list
    socketio.emit('join_room_add_user', data)


@socketio.on('leave_room')
def handle_leave_room(data):
    app.logger.info("{} left room {}".format(data['username'], data['room']))
    # Emit event to change class of a user so it appears disconnected
    socketio.emit('leave_room_remove_user', data)
    updateUserStatus(data['username'], data['room'], False)
    leave_room(data['room'])

@socketio.on('send_message')
def handle_send_message(data):
    # Send message to every user in the room
    addMessage(data['username'], data['room'], data['message'])
    socketio.emit('receive_message', data, room=data['room'])

if __name__ == "__main__":
    socketio.run(app, debug=True)
