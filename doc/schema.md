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

## Room

- id
- name
- type
  - open
  - private
- cafe
- maxUserCount
- userCount
- users
- master
- updated
- created
- lastMessage

### Incomplete level

1. complete (fetched /w SyncRoom)
2. userList (fetched /w GetRoomList, missing user list)
3. incomplete (fetched /w polling)

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
