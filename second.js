var _ = require('lodash');

var myRoom = Game.spawns.Spawn1.room
var myCreeps = myRoom.find(Game.MY_CREEPS)
var enemies = myRoom.find(Game.HOSTILE_CREEPS)
var sources = myRoom.find(Game.SOURCES)

var miners = _.filter(Game.creeps, {
    memory: {job: 'miner'}
});

var couriers = _.filter(Game.creeps, {
    memory: {role: 'courier'}
});

var soldiers = _.filter(Game.creeps, {
    memory: {role: 'soldier'}
});

if(miners.length < sources.length) {
    var newWorker = requestWorker();
    if (newWorker !== null) {
        newWorker.memory.job = 'miner'
    }
}

if(soldiers.length < 1) {
    requestSoldier();
}
if(soldiers.length < (enemies.length * 8)) {
    requestSoldier();
}
if(Game.spawns.Spawn1.energy > 200) {
    requestSoldier();
}

function requestWorker() {
    var unemployedWorkers = _.filter(Game.creeps, {
        memory: {role: 'worker', job: 'unemployed'}
    });
    if (unemployedWorkers.length === 0) {
        Memory.workerNeeded = true;
        return null;
    } else {
        Memory.workerNeeded = false;
        return unemployedWorkers[0];
    }
}

function requestCourier() {
    var unemployedCouriers = _.filter(Game.creeps, {
        memory: {role: 'courier', job: 'unemployed'}
    })
    if (unemployedCouriers.length === 0) {
        Memory.courierNeeded = true;
        return null;
    } else {
        Memory.courierNeeded = false;
        return unemployedCouriers[0];
    }
}

function requestSoldier() {
    Memory.soldierNeeded = true;
}

if(!Memory.spawnCycles) {
    Memory.spawnCycles = 0;
}

for (var name in Game.spawns) {
    var spawn = Game.spawns[name];
    
    if (!spawn.spawning) {
        
        Memory.spawnCycles ++
        switch(Memory.spawnCycles % 3) {
            case 0:
                if(Memory.workerNeeded === true) {
                    spawn.createCreep([Game.MOVE, Game.WORK, Game.CARRY], null, {role: 'worker', job:'unemployed', courier:null});
                    Memory.workerNeeded = false;
                }
                break;
            case 1:
                if(Memory.courierNeeded === true) {
                    spawn.createCreep([Game.MOVE, Game.MOVE, Game.CARRY], null, {role: 'courier', job: 'unemployed', pickup:null, dropoff:null, step:null});
                    Memory.courierNeeded = false;
                }
                break;
            case 2:
                if(Memory.soldierNeeded === true) {
                    spawn.createCreep([Game.TOUGH, Game.MOVE, Game.ATTACK], null, {role:'soldier', job: 'unemployed', target:null});
                    Memory.soldierNeeded = false;
                }
                break;
        }
    }
}

var i
for(i = 0; i < myCreeps.length; i++) {
	var creep = myCreeps[i];
    
    if (creep.memory.job == 'unemployed') { //wander
        // creep.moveTo(myRoom.getPositionAt(Math.floor(Math.random() * 50), Math.floor( Math.random() * 50)));
        creep.move(Math.random() * 8);
    }
}

for(i = 0; i < miners.length; i++) {
    var creep = miners[i];
    var target = i % sources.length;
    creep.moveTo(sources[target]);
    creep.harvest(sources[target]);
    if (creep.energy > 0) {
    if (creep.memory.courier === null) {
        var newCourier = requestCourier();
        if (newCourier !== null) {
            newCourier.memory.job = 'energyHarvest';
            newCourier.memory.step = 'pickup';
            newCourier.memory.dropoff = Game.spawns.Spawn1.name;
            newCourier.memory.pickup = creep.name;
            creep.memory.courier = newCourier.name;
        }
    } else {
        var courier = Game.creeps[creep.memory.courier];
        var energyAmount;
        if(typeof courier === 'undefined'){
            creep.memory.courier = null
        } else {
        if (creep.energy > courier.energyCapacity) {
            energyAmount = courier.energyCapacity
        } else {
            energyAmount = creep.energy
        }
        if (creep.transferEnergy(courier, energyAmount) === 0) {
            courier.memory.step = 'dropoff';
            creep.memory.courier = null;
        }
        }
    }
    }
}

for(i = 0; i < couriers.length; i++) {
    creep = couriers[i];
    if (creep.memory.job == 'energyHarvest') {
        if (creep.memory.step == 'pickup') {
            creep.moveTo(Game.creeps[creep.memory.pickup]);
        } else {
            creep.moveTo(Game.spawns.Spawn1);
            if (creep.transferEnergy(Game.spawns.Spawn1) === 0) {
                creep.memory.job = 'unemployed';
            }
        }
    }
}

for(i = 0; i < soldiers.length; i++) {
    creep = soldiers[i];
    if (enemies.length > 0) {
        if (creep.memory.job == 'unemployed') {
            creep.memory.job = 'deployed';
        } else {
            var target = enemies[0];
            creep.moveTo(target);
            creep.attack(target);
        }
    } else {
        creep.memory.job = 'unemployed';
    }
}
