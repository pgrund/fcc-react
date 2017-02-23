const TILE_HERO  = 5,
      TILE_ENEMY = 4,
     TILE_WEAPON = 3,
     TILE_HEALTH = 2,
       TILE_WALL = 1,
      TILE_EMPTY = 0;

class Tile extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      x : props.coord[0],
      y : props.coord[1],
      visible: true
    }
  }
  render() {
    var names = ['type', 'wall', 'health', 'weapon', 'enemy', 'hero'];
    return (this.state.visible ? <div className={"tile " + names[this.props.type]}><i className="fa"/></div> : <div className="tile blackedout"/> );
  }
}
Tile.propTypes = {
  coord: React.PropTypes.array.isRequired,
  type: React.PropTypes.number.isRequired
}
Tile.defaultProps = {
  type: 0
}

class Info extends React.Component {
  render() {
    var weapons = ['stick', 'knife', 'dagger', 'sword'];
    return (
      <ul className="info-bar">
        <li>Health: {this.props.health}</li>
        <li>Weapon: {weapons[Math.floor(this.props.weapon/7)]}</li>
        <li>Attack: {this.props.weapon}</li>
        <li>Dungeon Level: {this.props.level}</li>
      </ul>
    );
  }
}
Info.propTypes = {
  health: React.PropTypes.number.isRequired,
  weapon: React.PropTypes.number.isRequired,
  level: React.PropTypes.number.isRequired
}

class Game extends React.Component {
    constructor(props) {
      super(props);
      var dungeon = this.generateMap(0);
      this.state = {
        peek : false,
        level : 0,
        dungeon: dungeon.dungeon,
        hero: dungeon.hero,
        enemies: dungeon.enemies
      };

      this.generateMap = this.generateMap.bind(this);
      this.findTileInMap = this.findTileInMap.bind(this);
      this.placeTileOnMap = this.placeTileOnMap.bind(this);
      this.handleMove = this.handleMove.bind(this);
      // this.fightEnemy = this.fightEnemy.bind(this);
      // this.finishedDungeon = this.finishedDungeon.bind(this);
    }

    componentDidMount() {
      document.addEventListener("keydown", this.handleMove);
    }

    findTileInMap(gameMap, tile) {
      var res = []
      for(let x = 0; x < gameMap.length; x++) {
        for(let y = 0; y < gameMap[0].length; y++) {
          if(gameMap[x][y] == tile) {
            res.push({x: x, y: y});
          }
        }
      }
      if(res.length == 0 && tile == TILE_HERO) throw new Error('no hero in worldmap found');
      return res;
    }

    finishedDungeon(map) {
       if (this.findTileInMap(map, TILE_ENEMY).length == 0) {
         return 'level completed';
       } else if (false) {
         //
       };
    }


    handleMove(event) {
      var game = this;
      var hero = this.state.hero;

      var nextState = JSON.parse(JSON.stringify(this.state));
      var oldX = hero.coord.x,
          oldY = hero.coord.y;

      function fightEnemy(newX, newY) {
        var enemy = nextState.enemies.find(e => e.x == newX && e.y == newY);
        var hit = Math.floor(Math.random() * (hero.fight ? hero.weapon : enemy.weapon));
        console.log('FIGHTING!!');

        if(hero.fight) {
          enemy.health -= hit;
          console.log(`Hero's turn : enemy ${enemy.health} (-${hit})`);
        } else {
          nextState.hero.health -= hit;
          console.log(`Enemy's turn : hero ${nextState.hero.health} (-${hit})`);
        }
        game.setState({
          enemies: nextState.enemies
        });
        nextState.hero.fight = !hero.fight;
        return enemy.health <= 0;
      }

      function moveTo(dx, dy) {
        var newX = oldX + dx,
            newY = oldY + dy;

        function moveHero(targetTile = TILE_EMPTY) {
          nextState.hero.coord.x = newX;
          nextState.hero.coord.y = newY;

          nextState.dungeon[oldX][oldY] = targetTile;
          nextState.dungeon[newX][newY] = TILE_HERO;
        }

        var oldX = hero.coord.x,
            oldY = hero.coord.y,
            newX = hero.coord.x + dx,
            newY = hero.coord.y + dy;
        // check out of boundary
        if( newX >= nextState.dungeon.length || newX < 0 ||
            newY >= nextState.dungeon[0].length || newY < 0 ) {
              console.log('leaving worldmap');
              return;
        }

        switch (nextState.dungeon[newX][newY]) {
          case TILE_EMPTY:
            moveHero();
            break;
          case TILE_WALL:
            console.log('bang your head !!!');
            break;
          case TILE_HEALTH:
            console.log('picked up some healing ...');
            nextState.hero.health += 20;
            moveHero();
            break;
          case TILE_WEAPON:
            console.log('improved weapon');
            nextState.hero.weapon += 7;
            moveHero();
            break;
          case TILE_ENEMY:
            if(fightEnemy(newX, newY)) {
              moveHero();
              var checkNextAction = game.finishedDungeon(nextState.dungeon);
              if(checkNextAction == 'level completed') {
                  console.log(`SUCCESS !!! you beatup all enemies in dungeon ${game.state.level}`);
                  var nextLevel = game.state.level+1;
                  var nextDungeon;

                  try {
                    nextDungeon = game.generateMap(nextLevel);
                  } catch (e) {
                    // could not get map for next Level, stick to old one
                    console.error(e);
                    nextDungeon = {
                      dungeon: nextState.dungeon,
                      hero: nextState.hero
                    };
                    nextLevel = game.state.level;
                  }
                  nextState.dungeon = nextDungeon.dungeon;
                  nextState.hero.coord = nextDungeon.hero.coord;
                  nextState.level = nextLevel
                  nextState.enemies = nextDungeon.enemies;

                  document.removeEventListener("keydown", game.handleMove);
                  document.addEventListener("keydown", game.handleMove);
                  console.log('moving to next level', game.state);
              } else if (checkNextAction == 'hero dead') {
                console.log('You died !!');
                document.removeEventListener("keydown", game.handleMove);
              }
            }
            break;
          default:
            console.log('unknown', nextState.dungeon[newX][newY]);
        }
      }
      switch (event.key) {
        case 'ArrowUp':
          moveTo(-1, 0);
          break;
        case 'ArrowDown':
          moveTo(1, 0);
          break;
        case 'ArrowLeft':
          moveTo(0, -1);
          break;
        case 'ArrowRight':
          moveTo(0, 1);
          break;
        default:
          console.log('not reacting on', event)
      }
      this.setState(nextState);
    }

    placeTileOnMap(gameMap, tile, distance = 5) {
      var x = 0, y = 0;
      function tooClose() {
        return false;
        console.log('checking of too close', x,y,gameMap[x][y],distance);
        var sub = gameMap.filter((row, x1) => (x1 <= x+distance && x1 >= x-distance)).map(row =>
          row.filter((cell,y1)=> (y1 <= y+distance && y1 >= y-distance)))
        console.log(sub.map(row => row.join(',')).join('\n'), sub.some(row => row.every(cell => cell >= 2)));
        return sub.some(row => row.every(cell => cell >= 2));
      }

      while (gameMap[x][y] != 0 || tooClose()) {
        y = Math.floor(Math.random()* gameMap[0].length);
        x = Math.floor(Math.random()* gameMap.length);
        // console.log('found new coords', x, y, gameMap[x][y]);
      }
      gameMap[x][y] = tile;
    }
    generateMap(level = this.state.level) {
      var gamemap = this.props.dungeons[level];
      if(gamemap == undefined) {
        throw new Error(`no world specified for level ${level}`);
      }
      // console.log(`selected dungeon ${level}\n${gamemap.map(row => row.join(',')).join('\n')}`);
      this.placeTileOnMap(gamemap, TILE_HERO);
      for(var i=0; i< 3; i++) {
        this.placeTileOnMap(gamemap, TILE_ENEMY);
      }
      this.placeTileOnMap(gamemap, TILE_HEALTH);
      this.placeTileOnMap(gamemap, TILE_WEAPON);

      return {
        dungeon: gamemap,
        hero: {
          coord: this.findTileInMap(gamemap, TILE_HERO)[0],
          health: 100,
          weapon: 7,
          fight: true
        },
        enemies: this.findTileInMap(gamemap, TILE_ENEMY).map(e => {return {
            x: e.x,
            y: e.y,
            health: 10 *(1+level),
            weapon: 7 *(1+level)
          };
        })
      };
    }

    render() {
      var currentDungeon = this.state.dungeon;
      return (
        <div>
          <h3>Game</h3>
          <Info health={this.state.hero.health}
            weapon={this.state.hero.weapon}
            level={this.state.level}/>
          <div className="dungeon">
          {currentDungeon.map( (row, y) =>
            <div className="tile-row">
             { row.map((value, x) =>
               <Tile coord={[x,y]} type={value} />
             )}
            </div>
          )}
          </div>
        </div>
      );
    }
}

Game.propTypes = {
  visibleRadius: React.PropTypes.number.isRequires
}
Game.defaultProps = {
  visibleRadius: [12],
  dungeons: [
    [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,1,0,0,0,1,0,0,1],
      [1,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,1],
      [1,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,0,0,0,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1,0,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1,1,1,1,0,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1,1,1,1,0,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1,1,1,1,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
    ]
  ]
}

ReactDOM.render(
  <Game />,
  document.getElementById('app')
);
