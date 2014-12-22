for (var name in Game.spawns) {
    var spawn = Game.spawns[name];
    
    if(spawn.energy > 335) {
        spawn.createCreep([Game.WORK, Game.CARRY, Game.MOVE, Game.ATTACK, Game.TOUGH], null, {role: 'drone'});
    }
}

var myRoom = Game.spawns['Spawn1'].room
var myCreeps = myRoom.find(Game.MY_CREEPS)
var enemies = myRoom.find(Game.HOSTILE_CREEPS)

var i
for(i = 0; i < myCreeps.length; i++) {
	var creep = myCreeps[i];

    if (creep.memory.role == 'drone') {
        
        if (enemies.length > 0) {
            if (creep.energy > 0) {
                creep.moveTo(Game.spawns.Spawn1)
                creep.transferEnergy(Game.spawns.Spawn1, creep.energy)
            } else {
                var target = i % enemies.length
                creep.moveTo(enemies[target])
                creep.attack(enemies[target])
            }
        } else {
            if (creep.energy < creep.energyCapacity) {
                var targets = creep.room.find(Game.SOURCES)
                var target = Math.floor(i/5) % targets.length
                creep.moveTo(targets[target])
                creep.harvest(targets[target])
                // creep.moveTo(targets[0])
                // creep.harvest(targets[0])
            }
            if (creep.energy == creep.energyCapacity) {
                creep.moveTo(Game.spawns.Spawn1)
                creep.transferEnergy(Game.spawns.Spawn1, creep.energyCapacity)
            }
        }
        
    }
}
