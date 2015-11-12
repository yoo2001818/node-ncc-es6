# node-ncc-es6
Naver cafe chat library for Node.js with ES6

**STILL WORKING IN PROGRESS**

This is still in development!! DO NOT USE IN PRODUCTION YET

## Command Implementation
- [ ] CreateRoom
- [ ] InviteRoom
- [x] DeleteRoom
- [x] SyncRoom
- [ ] GetRoomList
- [ ] ChangeRoomName
- [ ] ~~SetRoomAlarm~~
- [ ] DelegateMaster
- [ ] FindOpenRoomList
- [ ] RejectMember
- [ ] FindMyCafeList
- [ ] ~~ProhibitWordCheck~~
- [ ] GetRoomMemberList
- [x] SendMsg
- [x] SyncMsg
- [ ] GetMsg
- [ ] AckMsg
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
- [ ] Invited
- [ ] ChangeRoomName
- [ ] DeleteRoom
- [ ] DelegateMaster
- [ ] JoinRoom
- [ ] RejectMember
- [ ] ClosedOpenroom
