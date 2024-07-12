const reg2 = /^https:\/\/testflight\.apple\.com\/join\/(.*)/;
if (reg2.test($request.url)) {
    let appId = $persistentStore.read("APP_ID");
    if (!appId) {
        appId = "";
    }
    let arr = appId.split(",");
    const id = reg2.exec($request.url)[1];
    arr.push(id);
    arr = unique(arr).filter((a) => a);
    if (arr.length > 0) {
        appId = arr.join(",");
    }
    $persistentStore.write(appId, "APP_ID");
    $notification.post("TestFlight Auto Join", `Added APP_ID: ${id}`, `Current IDs: ${appId}`);
    $done({});
}

function unique(arr) {
    return Array.from(new Set(arr));
}
