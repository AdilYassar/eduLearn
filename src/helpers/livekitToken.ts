import CryptoJS from 'crypto-js';

function base64url(source: CryptoJS.lib.WordArray) {
  let encodedSource = CryptoJS.enc.Base64.stringify(source);
  encodedSource = encodedSource.replace(/=+$/, '');
  encodedSource = encodedSource.replace(/\+/g, '-');
  encodedSource = encodedSource.replace(/\//g, '_');
  return encodedSource;
}

export function generateLiveKitToken(apiKey: string, apiSecret: string, roomName: string, participantName: string) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    exp: now + (60 * 60 * 24),
    nbf: now - (60 * 60 * 24),
    iss: apiKey,
    sub: participantName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + '-' + Math.floor(Math.random() * 1000),
    name: participantName,
    video: {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true
    }
  };

  const stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
  const encodedHeader = base64url(stringifiedHeader);

  const stringifiedPayload = CryptoJS.enc.Utf8.parse(JSON.stringify(payload));
  const encodedPayload = base64url(stringifiedPayload);

  const unsignedToken = encodedHeader + "." + encodedPayload;

  const signature = CryptoJS.HmacSHA256(unsignedToken, apiSecret);
  const encodedSignature = base64url(signature);

  const finalToken = unsignedToken + "." + encodedSignature;
  
  console.log('[LiveKit Token Builder] Payload formulated: ', JSON.stringify(payload));
  console.log('[LiveKit Token Builder] Final Length: ', finalToken.length);
  
  return finalToken;
}
  
  return finalToken;
}
