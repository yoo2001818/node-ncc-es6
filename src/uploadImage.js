export const UPLOAD_URL = 'https://up.cafe.naver.com';
export const UPLOAD_PIC_URL = '/AttachChatPhotoForJindoUploader.nhn';

function getCallbackFn() {
  // Mimic Jindo's behaviour
  return 'tmpFrame_' + (Math.floor(Math.random() * 9000 + 1000) + '_func');
}

// Upload image to the server. This doesn't send image to the chat, though.
export default function uploadImage(request, readStream, options = null) {
  const req = request(UPLOAD_URL + UPLOAD_PIC_URL);
  let form = req.form();
  form.append('photo', readStream, options);
  form.append('callback', '/html/AttachImageDummyCallback.html');
  form.append('callback_func', getCallbackFn());
  return req.then(body => {
    const regex = /\]\)\('([^']+)'\);/;
    let unpacked = regex.exec(body);
    if (unpacked.length < 2) {
      // Can we be more descriptive?
      throw new Error('File transfer failed');
    }
    unpacked = unpacked[1];
    const data = JSON.parse(unpacked);
    const param = {
      path: data.savedPath,
      fileSize: data.size,
      width: data.width,
      height: data.height
    };
    return param;
  });
}
