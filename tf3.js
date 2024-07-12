!(async () => {
    await handleAutoJoin();
    $done({});
})();

async function handleAutoJoin() {
    let ids = $persistentStore.read('APP_ID');
    if (ids == null) {
        $notification.post('No TestFlight APP_ID', 'Please manually add or use the TestFlight link to automatically retrieve', '');
    } else if (ids === '') {
        $notification.post('All TestFlight IDs Joined', 'Please manually disable this script', '');
    } else {
        ids = ids.split(',');
        for (const ID of ids) {
            await autoPost(ID);
        }
    }
}

function autoPost(ID) {
    const Key = $persistentStore.read('key');
    const testurl = 'https://testflight.apple.com/v3/accounts/' + Key + '/ru/';
    const header = {
        'X-Session-Id': $persistentStore.read('session_id'),
        'X-Session-Digest': $persistentStore.read('session_digest'),
        'X-Request-Id': $persistentStore.read('request_id'),
        'User-Agent': $persistentStore.read('tf_ua'),
    };

    return new Promise((resolve) => {
        $httpClient.get({ url: testurl + ID, headers: header }, (error, resp, data) => {
            if (!error) {
                if (resp.status === 404) {
                    let ids = $persistentStore.read('APP_ID').split(',');
                    ids = ids.filter(item => item !== ID);
                    $persistentStore.write(ids.toString(), 'APP_ID');
                    console.log(`${ID} TestFlight does not exist, automatically removed`);
                    $notification.post(ID, 'TestFlight does not exist', 'Automatically removed APP_ID');
                    resolve();
                } else {
                    const jsonData = JSON.parse(data);
                    if (jsonData.data == null) {
                        console.log(`${ID} ${jsonData.messages[0].message}`);
                        resolve();
                    } else if (jsonData.data.status === 'FULL') {
                        console.log(`${jsonData.data.app.name} ${ID} ${jsonData.data.message}`);
                        resolve();
                    } else {
                        $httpClient.post({ url: testurl + ID + '/accept', headers: header }, (postError, postResp, postBody) => {
                            if (!postError) {
                                const jsonBody = JSON.parse(postBody);
                                $notification.post(jsonBody.data.name, 'Successfully joined TestFlight', '');
                                console.log(`${jsonBody.data.name} Successfully joined TestFlight`);
                                let ids = $persistentStore.read('APP_ID').split(',');
                                ids = ids.filter(item => item !== ID);
                                $persistentStore.write(ids.toString(), 'APP_ID');
                                resolve();
                            } else {
                                console.log(`${ID} ${postError}`);
                                resolve();
                            }
                        });
                    }
                }
            } else {
                console.log(`HTTP request failed for ${ID}:`, error);
                $notification.post('Auto Join TestFlight', `HTTP request failed for ${ID}: ${error}`, '');
                resolve();
            }
        });
    });
}
