var generateCollisionData = function(mapData) {
  var collisionData = [];
  for (var i = 0; i < mapData.length; i++) {
    var row = mapData[i];
    collisionData.push([]);
    for (var j = 0; j < row.length; j++) {
      collisionData[i].push(row[j] == 1 ? 1 : 0);
    }
  }
  return collisionData;
}

var new2dArray = function(rows, cols) {
  var arr = new Array(rows);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = new Array(cols);
  }
  return arr;
};

var extractMapBlocks = function(map, blocks) {
  for (var i = 0; i < map.length; i++) {
    var row = map[i];
    for (var j = 0; j < row.length; j++) {
      if (row[j] == 2) {
        blocks[j][i] = newBlock(j, i);
        row[j] = 0;
      }
    }
  }
  return map;
};

var newBlock = function(x, y) {
  var block = new Sprite(32, 32);
  block.image = game.assets['game/block.png'];
  block.x = x * 32;
  block.y = y * 32;
  return block;
}

var addBlocks = function(blocks, scene) {
  for (var i = 0; i < blocks.length; i++) {
    var row = blocks[i];
    for (var j = 0; j < row.length; j++) {
      if (row[j]) {
        scene.addChild(row[j]);
      }
    }
  }
};

enchant();
window.onload = function() {
  game = new Game(600, 600);
  game.preload('game/tiles.png', 'game/player.png', 'game/block.png');

  player = new Sprite(32, 32);
  scene = new Scene();
  mapData = leveldata.data;
  height = leveldata.data.length;
  width = leveldata.data[0].length;

  map = new Map(32,32);
  blocks = new2dArray(mapData.length, mapData[0].length);
  game.onload = function() {
    game.pushScene(scene);

    baseMap = extractMapBlocks(mapData, blocks);

    map.image = game.assets['game/tiles.png'];
    map.loadData(baseMap);
    map.collisionData = generateCollisionData(baseMap);
    scene.addChild(map);

    addBlocks(blocks, scene);

    player.image = game.assets['game/player.png'];
    player.x = 32*leveldata.start[0];
    player.y = 32*leveldata.start[1];
    scene.addChild(player);
  };

  game.addEventListener('leftbuttondown', function() {
    move(player, -1, 0);
  });

  game.addEventListener('rightbuttondown', function() {
    move(player, 1, 0);
  });

  game.addEventListener('upbuttondown', function() {
    move(player, 0, -1);
  });

  game.addEventListener('downbuttondown', function() {
    move(player, 0, 1);
  });

  var inBounds = function(x, y) {
    return x >= 0 && x < width && y >= 0 && y < height;
  }

  var blocked = function(x, y) {
    return mapData[y][x] == 1;
  }

  var move = function(sprite, xinc, yinc) {
    var y = sprite.y/32;
    var x = sprite.x/32;
    var nx = x + xinc;
    var ny = y + yinc;

    //out of bounds
    if (!inBounds(nx, ny)) {
      console.log('out of bounds');
      return;
    }

    //wall
    if (blocked(nx, ny)) {
      console.log('collision ' + x + ' ' + y);
      return;
    }

    //block
    if (blocks[nx][ny]) {
      var nx2 = nx + xinc;
      var ny2 = ny + yinc;

      if (!inBounds(nx2, ny2)) {
        console.log('block out of bounds');
        return;
      }

      if (blocked(nx2, ny2)) {
        console.log('block collision');
        return;
      }

      if (blocks[nx2][ny2]) {
        console.log('double block collision');
        return;
      }

      var block = blocks[nx][ny];
      blocks[nx][ny] = undefined;
      blocks[nx2][ny2] = block;
      block.x = 32*nx2;
      block.y = 32*ny2;
    }

    sprite.x = 32*nx;
    sprite.y = 32*ny;
  };

  game.start();
};