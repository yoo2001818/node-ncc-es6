# tvCast

## Message

```js
{ url: 'http://tvcast.naver.com/v/608654',
  playerUrl: 'playerUrl.',
  title: '슈퍼맨이 돌아왔다 104회 예고 - 쌍둥이네 ',
  channel: '슈퍼맨이 돌아왔다',
  description: '슈퍼맨이 돌아왔다 104회 예고 - 쌍둥이네 \r\n',
  thumbnail: 'Burrr',
  thumbnailSecure: 'Burrrr',
  playtime: 66,
  ageLimit: false,
  playtimeText: '1:06' }
```

# reject

## Notification

```js
{ recvid: '<USER B ID>',
  cmd: 93007,
  ver: '1',
  bdy:
   { senderProfileUrl: { mobileApps: '', web: '' },
     cafeName: '<CAFE NAME>',
     cafeId: <CAFE ID>,
     targetMemberNickname: '<USER B NICKNAME>',
     roomName: '<ROOM NAME>',
     roomId: '<ROOM ID>',
     senderNickname: '<USER A NICKNAME>',
     senderId: '<USER A ID>' } }
```

## Message

```js
{ sender: { id: '<USER B ID>', nickName: '<USER B NICKNAME>' },
  actionItem: { nickname: '<USER A NICKNAME>', memberId: '<USER A ID>' } }
```

# invite

## Notification

```js
{ recvid: '<USER B ID>',
  cmd: 93002,
  ver: '1',
  bdy:
   { senderProfileUrl: { mobileApps: '', web: '' },
     cafeName: '<CAFE NAME>',
     isToInvitee: true,
     cafeId: <CAFE ID>,
     roomName: '<ROOM NAME>',
     roomId: '<ROOM ID>',
     senderNickname: '<USER A NICKNAME>',
     senderId: '<USER A ID>',
     msg: '' } }
```

## Message

```js
{ sender: { id: '<USER B ID>', nickName: '<USER B NICKNAME>' },
  groupChatBlockMemberList: [],
  secedeMemberList: [],
  target: [ { id: '<USER A ID>', nickName: '<USER A NICKNAME>' } ] }
```

# changeName

## Notification

```js
{ recvid: '<USER B ID>',
  cmd: 93003,
  ver: '1',
  bdy:
   { senderProfileUrl:
      { mobileApps: '<PROFILE URL>',
        web: '<PROFILE URL>' },
     cafeName: '<CAFE NAME>',
     cafeId: <CAFE ID>,
     roomName: '<ROOM NAME (Changed)>',
     roomId: '<ROOM ID>',
     senderNickname: '<USER B NICKNAME>',
     senderId: '<USER B ID>' } }
```

## Message

```js
{ sender: { id: '<USER B ID>', nickName: '<USER B NICKNAME>' },
  actionItem: '<ROOM NAME>' }
```

# leave

## Notification

```js
{ recvid: '<USER B ID>',
  cmd: 93004,
  ver: '1',
  bdy:
   { senderProfileUrl: { mobileApps: '', web: '' },
     cafeName: '<CAFE NAME>',
     cafeId: <CAFE ID>,
     roomName: '<ROOM NAME>',
     roomId: '<ROOM ID>',
     senderNickname: '<USER A NICKNAME>',
     senderId: '<USER A ID>' } }
```

## Message

```js
{ sender: { id: '<USER A ID>', nickName: '<USER A NICKNAME>' },
  actionItem: '<ROOM NAME>' }
```

# join

## Notification

```js
{ recvid: '<USER B ID>',
  cmd: 93006,
  ver: '1',
  bdy:
   { senderProfileUrl: { mobileApps: '', web: '' },
     cafeName: '<CAFE NAME>',
     cafeId: <CAFE ID>,
     roomName: '<ROOM NAME>',
     roomId: '<ROOM ID>',
     senderNickname: '<USER A NICKNAME>',
     senderId: '<USER A ID>' } }
```

## Message

```js
{ sender: { id: '<USER A ID>', nickName: '<USER A NICKNAME>' },
  actionItem: '<USER A NICKNAME>' }
```

# changeMaster

## Notification

```js
{ recvid: '<USER B ID>',
  cmd: 93005,
  ver: '1',
  bdy:
   { senderProfileUrl: { mobileApps: '', web: '' },
     cafeName: '<CAFE NAME>',
     cafeId: <CAFE ID>,
     masterUserId: '<USER B ID>',
     roomName: '<ROOM NAME>',
     roomId: '<ROOM ID>',
     senderNickname: '<USER A NICKNAME>',
     senderId: '<USER A ID>' } }
```

## Message

```js
{ sender: { id: '<USER B ID>', nickName: '<USER B NICKNAME>' },
  actionItem: '<USER A NICKNAME>' }
```

# create

This is impossible to obtain unless we implement GetMsg.

# ClosedOpenroom

Only staffs can issue this; I can't use it.
