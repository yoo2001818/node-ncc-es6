# node-ncc-es6
Naver cafe chat library for Node.js with ES6

**STILL WORKING IN PROGRESS**

This is still in development!! DO NOT USE IN PRODUCTION YET

## Command Implementation
- [x] CreateRoom
- [x] InviteRoom
- [x] DeleteRoom
- [x] SyncRoom
- [x] GetRoomList
- [x] ChangeRoomName
- [ ] ~~SetRoomAlarm~~
- [x] DelegateMaster
- [x] FindOpenRoomList
- [x] RejectMember
- [x] FindMyCafeList
- [ ] ~~ProhibitWordCheck~~
- [ ] ~~GetRoomMemberList~~
- [x] SendMsg
- [x] SyncMsg
- [x] GetMsg
- [x] AckMsg
- [ ] ~~ReportBadMember~~
- [x] CloseOpenroom
- [ ] ~~GetGroupChatUseConfigList~~
- [ ] ~~GetCafeGroupChatUse~~
- [ ] ~~ChageGroupChatUseConfig~~
- [ ] ~~GetBlockMemberList~~
- [ ] ~~AddBlockMember~~
- [ ] ~~DeleteBlockMember~~
- [ ] ~~CheckBlockMemberList~~
- [ ] External commands
  - [ ] CafeMemberList
  - [ ] CafeMemberSearch
  - [ ] ~~ChatTitleCheck~~

## Packet Handling
- [x] Msg
  - [x] Normal
  - [x] Invite
  - [x] Leave
  - [x] ChangeRoomname
  - [x] ChangeMasterId
  - [x] JoinRoom
  - [x] RejectMember
  - [x] OpenRoomCreateGreeting
  - [x] Sticker
  - [x] Image
  - [x] TvCast
- [x] Invited
- [x] ChangeRoomName
- [x] DeleteRoom
- [x] DelegateMaster
- [x] JoinRoom
- [x] RejectMember
- [x] ClosedOpenroom
