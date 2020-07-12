from pymongo import MongoClient
client = MongoClient("db url here")

chat_db = client.get_database('chatdb')

users_collection = chat_db.get_collection('users')
message_collection = chat_db.get_collection('messages')

def saveUser(username, room, pfp):
    users_collection.insert_one({'_id': users_collection.count_documents({}) + 1, 'username': username, 'room': room, 'connected': True, 'pfp': pfp})

def findUser(username, room):
    return users_collection.count_documents({'username': username, 'room':room})

def updateUserStatus(username, room, status):
    users_collection.find_one_and_update({'username': username, 'room': room}, {'$set':{'connected': status}})

def getAllUsersInRoom(room):
    return list(users_collection.find({'room': room}))

def addMessage(username, room, message):
    message_collection.insert_one({'_id': message_collection.count_documents({}) + 1,'username': username, 'room': room, 'message': message})

def getAllMessages(room):
    return list(message_collection.find({'room': room}))