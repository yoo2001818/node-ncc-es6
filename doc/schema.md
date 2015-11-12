# Schema of node-ncc-es6

This document lists JSON schema of objects used in node-ncc-es6.

## Session

A chat session.

- credentials
- sid - Session ID token.
- connected - Whether if session has connected to the server.
- cafes
- rooms

## Credentials

A credentials information used to communicate with the chat server.

- username
- password
- cookieJar

## Cafe

- id
- name
- image
- users
- rooms
- load
- loading

### Load level

1. 0 - complete (fetched /w FindOpenRoomList)
2. 1 - partial (fetched /w GetRoomList)
3. 2 - bare (fetched /w polling)

## Room

- id
- name
- isPublic
- is1to1
- cafe
- maxUserCount
- userCount
- users
- master
- updated
- lastMessage
- load
- loading

### Load level

1. 0 - complete (fetched /w SyncRoom)
2. 1 - partial (fetched /w GetRoomList, missing user list)
3. 2 - bare (fetched /w polling or FindOpenRoomList)

## User

- id
- nickname
- image
- cafe

## Message

- id (= msgSn)
- room
- type
- time
- user
- message
- data
- sent

### image

- width
- height
- thumb
- image

### sticker

- name
- pack
- image
- mdpi
- xhdpi
- xxhdpi

### tvCast

- url
- channel
- description
- title
- playtime
- thumbnail

### join, reject, leave

- target (containing a user)

### invite

- target (containing array of users)

### changeName, changeMaster, create

- target (raw data sent from the server)

# Class reference

## Session

### constructor(credentials)

### sendCommand(command, body)

Sends a command to the server and returns a Promise.

There should be wrapper function of this; This shouldn't be used externally.

### deleteRoom(room)

Leaves (Deletes) room. Returns a Promise associated with the command.

### closeOpenroom(room)

Forcefully shutdowns the room. Only staffs can run this command.
Also, this returns a Promise.

### syncRoom(room)

Load room data from the server. Returns a Promise.

### sendMsg(message)

Sends a message to the server. This shouldn't be used externally.
Returns a Promise.

### sendText(room, text)

Sends a text message to the server. Returns a Promise.

### sendSticker(room, stickerId)

Sends a sticker to the server. Returns a Promise.

### sendImage(room, image || stream, options)

Uploads and sends an image to the server. Returns a Promise.

### connect()

Connects to the chat server using the credentials. Returns a Promise.

### disconnect()

Disconnect from the chat server.

### Events

#### connect()

#### disconnect()

#### message(message)

#### error(error)

## Credentials

### constructor(username, password, cookieJar)

### setCookieJar(cookieJar)

### getCookieJar()

### validateLogin()

Check login status of the cookie jar. Returns a Promise.

The promise resolves with user ID if it's logged in, or it rejects if not
logged in.

### login()

Log in to the server. Returns a Promise.

### logout()

Log out from the server.

### Events

Session automatically tries relogining if login state has invalidated, etc.
So in order to keep the login state in sync with the disk, you need to
listen to these events and save cookie jar to the disk.

#### login()

#### logout()
