// Server address
export const CHAT_HOME_URL = 'https://chat.cafe.naver.com/ChatHome.nhn';
export const CHAT_BROKER_URL = 'http://chat.cafe.naver.com';
export const CHAT_BROKER_SSL_URL = 'https://chat.cafe.naver.com';
export const SESSION_SERVER_URLS = ['https://ss.cafe.naver.com'];
// This may look better if I've used lodash. :/
// Still better than old version of node-ncc.
for (let i = 1; i <= 20; ++i) {
  SESSION_SERVER_URLS[i] = `https://ss${i}.cafe.naver.com`;
}

// Command type enums
// I don't think this is a 'config' though..
export const COMMAND_TYPE = {
  CreateRoom: 1101,
  InviteRoom: 1102,
  DeleteRoom: 1005,
  SyncRoom: 1006,
  GetRoomList: 1010,
  ChangeRoomName: 1011,
  SetRoomAlarm: 1012,
  DelegateMaster: 1013,
  FindOpenRoomList: 1014,
  RejectMember: 1015,
  FindMyCafeList: 1016,
  ProhibitWordCheck: 1017,
  GetRoomMemberList: 2001,
  SendMsg: 3001,
  SyncMsg: 3002,
  GetMsg: 3003,
  AckMsg: 3004,
  ReportBadMember: 5001,
  CloseOpenroom: 6001,
  GetGroupChatUseConfigList: 100001,
  GetCafeGroupChatUse: 100002,
  ChageGroupChatUseConfig: 100003,
  GetBlockMemberList: 100101,
  AddBlockMember: 100102,
  DeleteBlockMember: 100103,
  CheckBlockMemberList: 100104
};
export const COMMAND_RESULT_CODE = {
  SUCCESS: 0,
  ERR_NOT_DEFINED_COMMAND: 104,
  NOT_FOUND_ROOM: 1001,
  NOT_ROOM_MEMBER: 1002,
  WRONG_ROOM_INFO: 1003,
  WRONG_ROOM_MEMBER_INFO: 1004,
  NOT_ALLOW_ROOM_AUTH: 1005,
  OVER_ROOM_MEMBER_LIMIT: 1006,
  NOT_ALLOW_CREATE_ROOM_MEMBER_LEVEL: 1007,
  NOT_ALLOW_CREATE_ROOM_UNUSED_CHAT: 1008,
  NOT_ALLOW_CREATE_ROOM_BLOCKED_USER: 1009,
  NOT_SUPPORT_ROOM_TYPE: 1010,
  NOT_SUPPORT_MESSAGE_TYPE: 1011,
  ALREADY_EXIST_ROOM: 1012,
  NOT_SUPPORT_INVITE: 1013,
  INVALID_ROOM_MEMBER_COUNT: 1014,
  EXCEED_ROOM_COUNT: 1015,
  NOT_EXIST_SESSION: 1016,
  INVALID_SESSION_ID: 1017,
  ALREADY_EXIST_ROOM_MEMBERS: 1018,
  NOT_ALLOW_CREATE_ROOM_UNUSE_GROUPCHAT: 1019,
  NOT_ALLOW_CREATE_ROOM_SENDER_IS_NOT_CAFEMEMBER: 1020,
  NOT_ALLOW_CREATE_ROOM_NOT_EXIST_CAFEMEMBER: 1021,
  NOT_ALLOW_CREATE_ROOM_NOT_EXIST_USEGROUPCHAT_MEMBER: 1022,
  ALREADY_BLOCK_MEMBER: 1023,
  NOT_ALLOW_DELEGATE_MASTER_NOT_ALLOW_ROOM_TYPE: 1024,
  NOT_ALLOW_DELEGATE_MASTER_NOT_EXIST_MEMBER: 1025,
  NOT_ALLOW_DELEGATE_MASTER_INACTIVE_ROOM: 1026,
  NOT_ALLOW_REJECT_ONES_OWN_THIS: 1027,
  NOT_ALLOW_REJECT_MASTER_USER: 1028,
  NOT_CAFEMEMBER: 1029,
  GROUP_CHAT_BLOCK: 1030,
  REJECTED_MEMBER: 1031,
  NOT_ALLOW_ROOM_TYPE: 1033,
  NEED_TO_INSERT_CAPTCHA_WHEN_CREATE_ROOM: 1034,
  INVALID_CAPTCHA_KEY_VALUE_WHEN_CREATE_ROOM: 1035,
  NEED_TO_INSERT_CAPTCHA_WHEN_INVITE_ROOM: 1036,
  INVALID_CAPTCHA_KEY_VALUE_WHEN_INVITE_ROOM: 1037,
  EXCEED_MEMBER_DAILY_LIMIT: 1101,
  EXCEED_MEMBER_TIME_LIMIT: 1102,
  PROHIBIT_WORD_EXIST: 1103,
  ERR_USER_CUSTOM_MESSAGE_ALERT: 9901,
  ERR_USER_CUSTOM_MESSAGE_ALERT_AND_BACK: 9902,
  ERR_USER_CUSTOM_MESSAGE_ALERT_AND_CLOSE: 9903,
  AUTHENTICATION_ERROR: 10000,
  INVALID_AUTHENTICATION_ERROR: 10001,
  COMMON_ERROR: 90000,
  INVALID_COMMAND_ERROR: 90001,
  INSPECTION_MODE: 99999
};
