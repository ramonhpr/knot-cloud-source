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
        if (fn)
            fn(gateways)
    } else {
        var filteredGateways = gateways.filter(function (element) {
            return uuids.some(function (uuid) {
                return uuid === element.gatewayDevice.uuid;
            });
        });
        if (fn)
            fn(filteredGateways);
    }
}

function findGatewayByUUId(uuid,fn){
    var gatewayIndex = gateways.findIndex(function (element) {
        return element.gatewayDevice.uuid === uuid;
    });

    if(gatewayIndex>=0) {
        if (fn) {
            fn(null, gateways[gatewayIndex]);
        }
    } else {
        if (fn) {
            fn(new Error('Gateway '+uuid+' not found'));
        }
    }
}

function findMappingByThingUUId(uuid,fn){
    var mapIndex = gatewayDeviceMap.findIndex(function (element) {
        return element.thingUUID === uuid;
    });
    if (mapIndex >=0) {
        if (fn) {
            fn(null, gatewayDeviceMap[mapIndex]);
        }
    } else {
        if (fn) {
            fn(new Error('Mapping not found'));
        }
    }
}

function removeMapping(uuid, callback) {
    var mapping = null;
    if (uuid) {
        var mapIndex = gatewayDeviceMap.findIndex(function (element) {
            return element.thingUUID === uuid;
        });
        if (mapIndex >= 0) {
            mapping = gatewayDeviceMap.splice(mapIndex, 1);
        }
        if (callback) {
            callback(null,mapping);
        }
    } else {
        if (callback) {
            callback(new Error('Invalid argument'));
        }
    }
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
    var mapping = null;
    if (data.thingUUID && data.gatewayUUID && data.mapping) {
        removeMapping(data.thingUUID, function onRemoved(err,mapping) {
            if (err) {
                if (callback) {
                    callback(err);
                }
            } else {
                gatewayDeviceMap.push(data);
                if (callback) {
                    callback();
                }
            }
        });
    } else {
        if (callback) {
            callback(new Error('Invalid argument'));
        }
        
    }
}
module.exports.updateGatewayDeviceMapping = function(data, callback) {
    var mapping = null;
    if (data && data.gatewayUUID && data.mappings) {
        var mapIndex = gatewayDeviceMap.findIndex(function (element) {
            return element.gatewayUUID === data.gatewayUUID;
        });
        if (mapIndex >= 0) {
            mapping = gatewayDeviceMap.splice(mapIndex, 1).concat(data.mappings);
        } else {
            mapping = gatewayDeviceMap.concat(data.mappings);
        }
        
        if (callback) {
            callback(null, mapping);
        }
    } else {
        if (callback) {
            callback(new Error('Invalid argument'));
        } 
    }
}

module.exports.getMapping = function (uuid, callback) {
    var mapping = null;
    if (uuid) {
        var mapIndex = gatewayDeviceMap.findIndex(function (element) {
            return element.thingUUID === uuid;
        });
        if (mapIndex >= 0) {
             mapping = gatewayDeviceMap[mapIndex].mapping;
             if (callback) {
                callback(mapping);
             }
        } else {
            if (callback) {
                callback(new Error('Mapping not found'));
            }
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
    var gateway = null;
    if (gateways && gateways.length > 0 && socket.skynetDevice) {
        var removeIndex = gateways.findIndex(function (element) {
            return element.gatewaySocket.id === socket.id;
        });
        if (removeIndex >= 0) {
            gateway = gateways.splice(removeIndex, 1);
        }

        if (callback) {
            callback(null, gateway);
        }
    } else {
        if (callback) {
            callback(new Error('Invalid argument'));
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