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

var newPathMarker = function(count, x, y) {
    var path_count = new Sprite(32, 32);
    var tmp = new Surface(32, 32);
    tmp.context.fillStyle = ['#9a0', '#781', '#672', '#562'][Math.floor(Math.random()*4)];
    tmp.context.fillRect(0,0,32,32);
    tmp.context.strokeStyle = '#220';
    tmp.context.lineWidth = 3;
    tmp.context.strokeRect(0,0,32,32);

    tmp.context.fillStyle = '#EEE';
    tmp.context.font = 'bold 12pt Verdana';
    var hspace = (count >= 10 ? (count >= 100 ? 0 : 5) : 9);
    tmp.context.fillText(''+count, hspace, 23);

    path_count.image = tmp;
    path_count.x = x;
    path_count.y = y;
    return path_count;
};

var checkWin = function(count, sprite) {
  if (count == leveldata.steps && sprite.x/32 == leveldata.end[0] && sprite.y/32 == leveldata.end[1]) {
    alert('win');
    return true;
  } else
    return false;
}

enchant();
window.onload = function() {
  game = new Game(600, 600);
  game.preload('game/tiles.png', 'game/player_0.png', 'game/player_1.png', 'game/goal.png', 'game/block.png');

  player = new Group();
  player_bg = new Sprite(32, 32);
  player_fg = new Sprite(32, 32);

  scene = new Scene();
  path = new Group();
  count = 0;

  mapData = leveldata.data;
  height = leveldata.data.length;
  width = leveldata.data[0].length;

  goal = new Sprite(32, 32);

  map = new Map(32,32);
  blocks = new2dArray(mapData.length, mapData[0].length);
  game.onload = function() {
    game.pushScene(scene);

    baseMap = extractMapBlocks(mapData, blocks);

    map.image = game.assets['game/tiles.png'];
    map.loadData(baseMap);
    map.collisionData = generateCollisionData(baseMap);
    scene.addChild(map);

    scene.addChild(path);

    addBlocks(blocks, scene);

    goal.image = game.assets['game/goal.png'];
    goal.x = 32*leveldata.end[0];
    goal.y = 32*leveldata.end[1];
    scene.addChild(goal);

    player_bg.image = game.assets['game/player_0.png'];
    player_fg.image = game.assets['game/player_1.png'];
    player.addChild(player_bg);
    player.addChild(player_fg);

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
    var old_x = sprite.x;
    var old_y = sprite.y;
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
    player_fg.x = -20*xinc;
    player_fg.y = -20*yinc;

    count++;

    if (!checkWin(count, sprite))
      path.addChild(newPathMarker(count, old_x, old_y));
 };

  game.addEventListener('enterframe', function() {
    player_fg.rotate(30);
    player_fg.x = player_fg.x * 0.7;
    player_fg.y = player_fg.y * 0.7;
    goal.rotate(15);
  });

  game.addEventListener('keypress', function() {
    alert(e.keyCode);
  });

  game.start();
};
