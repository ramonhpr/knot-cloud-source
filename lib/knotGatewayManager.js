'use strict';
var config = require('./../config');
var getDevice = require('./getDevice');
var devices = require('./database').devices;

var gateways = [];
var gatewayDeviceMap = [];


function isGateway(device){
    return device.type === "gateway" || config.knotInstanceType === "gateway";
}

function getFilteredGateways(uuids, fn) {
    if (uuids[0] === "*") {
        fn(gateways)
    } else {
        var allGateways = []
        var requiredIndex = gateways.findIndex(function (element, index, array) {
            uuids.forEach(function(uuid) {
                if (uuid === element.gatewayDevice.uuid)
                    allGateways.push(element);
            }, this);

            if (index === gateways.length - 1) {
                return true;
            }
        });
        if (requiredIndex >= 0)
            fn(allGateways);
    }
}

function findGatewayByUUId(uuid,fn){
    var requiredIndex = gateways.findIndex(function (element, index, array) {
        if (element && element.gatewayDevice.uuid === uuid) {
            return true;
        }
    });
    fn(gateways[requiredIndex]);
}

function findMappingByThingUUId(uuid,fn){
    var requiredIndex = gatewayDeviceMap.findIndex(function (element, index, array) {
        if (element.thingUUID === uuid) {
            return true;
        }
    });
    fn(gatewayDeviceMap[index]);
}

module.exports.getThingGateway = function(uuid,fn){
    var endString = uuid.substr(uuid.length - 4, 4);
    var stringBegin = uuid.substr(0, uuid.length - 4);
    if(gateways && gateways.length > 0 && endString !== "0000"){
        var gatewayUUID = stringBegin + "0000";
        findGatewayByUUId(gatewayUUID,function(gateway){
            fn(gateway);
        });
    }
    else{
        fn(null);
    }
}

module.exports.addMapping = function (data, callback) {
    if (data.thingUUID && data.gatewayUUID && data.mapping) {
        var requiredIndex = gatewayDeviceMap.findIndex(function (element, index, array) {
            if (element && element.thingUUID === data.thingUUID) {
                return true;
            }
        });
        if (requiredIndex < 0)
            gatewayDeviceMap.push(data);
        callback(data.thingUUID + " thing mapping added");
    }
}
module.exports.updateGatewayDeviceMapping = function(data, callback) {
    if (data && data.gatewayUUID && data.mappings) {
        var requiredIndex = gatewayDeviceMap.findIndex(function (element, index, array) {
            if (element && element.gatewayUUID === data.gatewayUUID) {
                return true;
            }
        });
        if (requiredIndex >= 0) {
            gatewayDeviceMap.splice(requiredIndex, 1);
            console.log(element.gatewayUUID + " map removed");
        }
        data.mappings.forEach(function(element) {
            gatewayDeviceMap.push(element);
        }, this);

        callback(data.gatewayUUID + " gateway mapping updated");
    }
}

module.exports.getMapping = function (uuid, callback) {
    var mapping = null;
    if (uuid) {
        var requiredIndex = gatewayDeviceMap.findIndex(function (element, index, array) {
            if (element.thingUUID === uuid) {
                return true;
            }
        });
        if (requiredIndex >= 0)
            mapping = gatewayDeviceMap[requiredIndex].mapping;
    }
    callback(mapping)
}

module.exports.removeMapping = function (uuid, callback) {
    if (uuid) {
        var requiredIndex = gatewayDeviceMap.findIndex(function (element, index, array) {
            if (element.thingUUID === uuid) {
                return true;
            }
        });
        if (requiredIndex >= 0){
            gatewayDeviceMap.splice(requiredIndex, 1);
            callback(uuid + " thing mapping removed");
        }

    }
}

module.exports.addGateway = function (socket, callback) {
    if (socket.skynetDevice) {
        getDevice(socket.skynetDevice.uuid, function (err, device) {
            if (err) { callback(null); }
            var gateway = device && device.type && isGateway(device);
            if (gateway)
                gateways.push({
                    gatewaySocket: socket,
                    gatewayDevice: device
                });
            callback(gateway);
        });
    }
}

module.exports.removeGateway = function (socket, callback) {
    if (gateways && gateways.length > 0 && socket.skynetDevice) {
        var requiredIndex = gateways.findIndex(function (element, index, array) {
            if (element && element.gatewaySocket.id === socket.id) {
                return true;
            }
        });
        if (requiredIndex >= 0) {
            gateways.splice(requiredIndex, 1);
                if (callback)
                    callback();
        }

    }
}

module.exports.getDeviceMappings = function(){
    return gatewayDeviceMap;
}

module.exports.getGatewayDevices = function (data, fn) {
    if (this.gateways && gateways.length > 0 && (data.query.gateways instanceof Array)) {
        getFilteredGateways(data.query.gateways, function (filteredGateways) {
            var allDevices = [];
            filteredGateways.forEach(function (gateway, outerIndex) {
                gateway.gatewaySocket.emit('getDevices', { request: data.query, fromUuid: gateway.gatewayDevice.uuid }, function (result) {
                    if (result.devices) {
                        result.devices.forEach(function (device, innerIndex) {
                            allDevices.push(device);
                        });
                        if (outerIndex === gateways.length - 1) {
                            fn(allDevices);
                        }
                    }
                    else {
                        fn(result);
                    }
                });
            });
        })
    }
    else{
        fn({"Error":"Check if there is connected gateways or if gateway query filter is '*' or array of uuids"});
    }
}

module.exports.updateGatewayDevices = function (gateway, data, fn) {
    if (gateway) {
        gateway.gatewaySocket.emit('updateDevices', { request: data, fromUuid: gateway.gatewayDevice.uuid },
            function (result) {
                fn(result);
            });
    }
}

module.exports.createGatewayDevices = function (data,fn) {
    findGatewayByUUId(data.gateway, function (gateway) {
        if (gateway) {
            gateway.gatewaySocket.emit('createDevices', { request: data.body, fromUuid: gateway.gatewayDevice.uuid },
                function (result) {
                    fn(result);
                });
        }
        else{
             fn({"error":"gateway not found"});
        }

    });
}

module.exports.gateways = gateways;