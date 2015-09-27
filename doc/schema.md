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
