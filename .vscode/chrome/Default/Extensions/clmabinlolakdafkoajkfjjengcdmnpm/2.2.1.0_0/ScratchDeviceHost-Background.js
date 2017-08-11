
var nativePort = chrome.runtime.connectNative("edu.mit.scratch.device");
var callNumber = 0;
var portID = {};
var pendingCallbacks = {}; // map: native callback token -> [client port, client callback token]
var deviceOwnership = {}; // map: path -> client port


// Handle a message coming from the NMH
function handleNativeMessage(message) {
    var port = undefined;
    if (message[0] == "@") {
        var nativeCallbackNumber = message[1];
        var callbackTuple = pendingCallbacks[nativeCallbackNumber];
        delete pendingCallbacks[nativeCallbackNumber];
        if (callbackTuple) {
            port = callbackTuple[0];
            message[1] = callbackTuple[1]; // replace native callback token with client callback token
        }
    } else {
        // All non-callback client-facing calls must include a device path as the second argument
        var devicePath = message[1];
        port = deviceOwnership[devicePath];
    }
    if (port)
        port.postMessage(message);
    else
        console.log("SDH-Background: Could not determine client port for native message: " + message);
}

// Handle a connection coming from a port on some tab
function handleConnect(clientPort) {
    clientPort.onMessage.addListener(function (message) {
        handleMessage(clientPort, message);
    });
    clientPort.onDisconnect.addListener(function () {
        handleDisconnect(clientPort);
    });
}

function handleMessage(clientPort, message) {
    var clientCallbackToken = message[0];
    var actualMessage = message[1];
    if (actualMessage[0] == "claim") {
        // this port is claiming ownership of a particular device
        var path = actualMessage[1];
        deviceOwnership[path] = clientPort;
        var reply = ["@", clientCallbackToken];
        clientPort.postMessage(reply);
    } else {
        var nativeCallbackToken = (callNumber++).toString();
        var nativeMessage = [nativeCallbackToken, actualMessage];
        pendingCallbacks[nativeCallbackToken] = [clientPort, clientCallbackToken];
        nativePort.postMessage(nativeMessage);
    }
}

function handleDisconnect(port) {
    var numCallbacks = 0;
    for (var key in pendingCallbacks) {
        if (pendingCallbacks[key][0] == port) {
            ++numCallbacks;
            delete pendingCallbacks[key];
        }
    }
    var numDevices = 0;
    for (var key in deviceOwnership) {
        if (deviceOwnership[key] == port) {
            ++numDevices;
            delete deviceOwnership[key];
        }
    }
    //console.log("SDH-Background: client port disconnected with " +
    //    numDevices + " devices and " + numCallbacks + " pending callbacks");
}

nativePort.onMessage.addListener(handleNativeMessage);
chrome.runtime.onConnectExternal.addListener(handleConnect);
