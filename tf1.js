const reg1 = /^https:\/\/testflight\.apple\.com\/v3\/accounts\/(.*)\/apps$/;
if (reg1.test($request.url)) {
    let url = $request.url;
    let key = url.replace(/(.*accounts\/)(.*)(\/apps)/, '$2');
    let session_id = $request.headers['X-Session-Id'] || $request.headers['x-session-id'];
    let session_digest = $request.headers['X-Session-Digest'] || $request.headers['x-session-digest'];
    let request_id = $request.headers['X-Request-Id'] || $request.headers['x-request-id'];
    let ua = $request.headers['User-Agent'] || $request.headers['user-agent'];

    $persistentStore.write(key, 'key');
    $persistentStore.write(session_id, 'session_id');
    $persistentStore.write(session_digest, 'session_digest');
    $persistentStore.write(request_id, 'request_id');
    $persistentStore.write(ua, 'tf_ua');

    console.log("Session info stored:", { key, session_id, session_digest, request_id, ua });

    if ($persistentStore.read('request_id') !== null) {
        $notification.post('TF Info Retrieved', 'Session info successfully retrieved. Please disable the script!', '');
    } else {
        $notification.post('TF Info Retrieval Failed', 'Failed to retrieve session info. Please enable Mitm over HTTP2 and restart VPN and TestFlight App!', '');
    }
    $done({});
}
