const
TILE_WALL_BOTTOM_RIGHT = 15,
TILE_WALL_BOTTOM_LEFT = 14,
TILE_WALL_TOP_RIGHT = 13,
 TILE_WALL_TOP_LEFT = 12,
      TILE_WALL_TOP = 11,
   TILE_WALL_BOTTOM = 10,
    TILE_WALL_RIGHT = 9,
     TILE_WALL_LEFT = 8,
        TILE_SINGLE = 7,
          TILE_BOSS = 6,
         TILE_ENEMY = 5,
          TILE_HERO = 4,
        TILE_WEAPON = 3,
        TILE_HEALTH = 2,
          TILE_WALL = 1,
         TILE_EMPTY = 0;

const LOGLEVEL_DEBUG = 0,
      LOGLEVEL_INFO = 1,
      LOGLEVEL_WARN = 2,
      LOGLEVEL_ERROR = 3;
const TILES = ['empty', 'wall', 'health', 'weapon', 'hero', 'enemy', 'boss', 'wall single', //7
  'left wall', 'right wall', //9
  'bottom wall', 'top wall', //11
  'top left wall', 'top right wall', //13
  'bottom left wall', 'bottom right wall' //15
];
const LOGLEVEL = ['debug', 'info', 'warn', 'error'];
const WEAPONS = ['stick', 'knife', 'dagger', 'sword'];

class Tile extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      x : props.coord[0],
      y : props.coord[1]
    }
  }
  render() {
    return (this.props.visible ? <div className={"tile " + TILES[this.props.type]}><i className="fa"/></div> : <div className="tile blackedout"/> );
  }
}
Tile.propTypes = {
  coord: React.PropTypes.array.isRequired,
  type: React.PropTypes.number.isRequired,
  visible: React.PropTypes.bool
}
Tile.defaultProps = {
  type: 0,
  visible: true
}

class Controls extends React.Component {
  render() {
    return (
    <div className={"dc row " + this.props.classes}>
      <div className="col-xs-6" onClick={this.props.onPeekToggle}>
        <i className={"fa fa-peek-"+(this.props.peek ? 'on' : 'off')} /> peek map
      </div>
      <div className="col-xs-6" onClick={this.props.onAckAll}>
        <i className="fa fa-ack" /> Clear all messages
      </div>
    </div>
    );
  }
}
Controls.propTypes = {
  classes: React.Component.string,
  peek: React.PropTypes.bool.isRequired,
  onPeekToggle: React.PropTypes.func.isRequired,
  onAckAll: React.PropTypes.func.isRequired
}
Controls.defaultProps = {
  peek: false,
  onPeekToggle: function() {
    console.warn('no function specified to toggle peek!')
  },
  onAckAll: function() {
    console.warn('no function specified to acknowledge messages!')
  }
}
class HeroInfo extends React.Component {
  render() {
    return (
      <div className={"row " + this.props.classes}>
        <p className="col-xs-3">Health: {this.props.health}</p>
        <p className="col-xs-3">Weapon: {WEAPONS[this.props.weapon/7]}</p>
        <p className="col-xs-3">Attack: {this.props.weapon}</p>
        <p className="col-xs-3">Experience: {this.props.level}</p>
      </div>
    );
  }
}
HeroInfo.propTypes = {
  classes: React.PropTypes.string,
  health: React.PropTypes.number.isRequired,
  weapon: React.PropTypes.number.isRequired,
  level: React.PropTypes.number.isRequired
}
HeroInfo.defaultProps = {
  classes: '',
  level: 0
}

class MessageBox extends React.Component {

  render() {
    if(this.props.messages.length > 0) {
      return (
        <div className="messages">
          <ul className="fa-ul">
            {this.props.messages.sort((m1,m2) => m1.id < m2.id).map((m, idx, arr) =>
              <li title={new Date(m.id)} className={'message ' + LOGLEVEL[m.level]}>
                <i className="fa-li fa fa-trash" onClick={() => this.props.handleAck(m.id)}/>
                {m.message}
              </li>
            )}
          </ul>
        </div>
      );
    }
    return (<span />);
  }
}
MessageBox.propTypes = {
  handleAck: React.PropTypes.func.isRequired
}
MessageBox.defaultProps = {
  handleAck: function(id) {
    console.warn(`no function specified to acknowledge message ${id}`);
  }
}

class Game extends React.Component {
    constructor(props) {
      super(props);
      var dungeon = this.generateMap(this.props.startLevel);
      this.state = {
        peek : true,
        level : this.props.startLevel,
        dungeon: dungeon.dungeon,
        hero: dungeon.hero,
        enemies: dungeon.enemies,
        messages: []
      };

      this.generateMap = this.generateMap.bind(this);
      this.findTileInMap = this.findTileInMap.bind(this);
      this.placeTileOnMap = this.placeTileOnMap.bind(this);
      this.handleMove = this.handleMove.bind(this);
      this.createMessage = this.createMessage.bind(this);
      this.ackMessage = this.ackMessage.bind(this);
      this.peekToggle = this.peekToggle.bind(this);
    }

    componentDidMount() {
      document.addEventListener("keydown", this.handleMove);
    }

    peekToggle() {
      var nextPeek = !this.state.peek;
      this.setState({peek : nextPeek});
      if(nextPeek) {
        this.createMessage('peek into map, will close after 5sec ...', LOGLEVEL_INFO);
        setTimeout(this.peekToggle, 5000);
      }
    }

    ackMessage(id) {
      if(id == undefined) {
          console.log('ack all messages');
          this.setState({
            messages: []
          });
      } else {
        console.log(`ack message with id ${id}`);
        var msgs = this.state.messages.filter(m => m.id != id);
        this.setState({
          messages: msgs
        });
      }
    }
    createMessage(msg, level = LOGLEVEL_DEBUG) {
      if(level >= this.props.logLevel) {
        var m = {
          message: msg,
          level: level,
          id: (new Date()).getTime()
        };
        var nextMessages = this.state.messages.concat(m)
        this.setState({
          messages: nextMessages
        });
        setTimeout(() => this.ackMessage(m.id), 5000);
      }
    }
    findTileInMap(gameMap, tile) {
      if(gameMap == undefined) {
        throw new Error('trying to find a tile on an undefined map')
      }
      var res = [];
      for(var row = 0; row < gameMap.length; row++) {
        for(var col = 0; col < gameMap[row].length; col++) {
          if(gameMap[row][col] == tile) {
            res.push({x: row, y: col});
          }
        }
      }
      if(res.length == 0 && tile == TILE_HERO) throw new Error('no hero in worldmap found');
      return res;
    }

    finishedDungeon(state) {
       if (this.findTileInMap(state.dungeon, TILE_BOSS).length == 0 &&
          this.props.dungeons.length == this.state.level+1) {
         return 'finished';
       } else if (this.findTileInMap(state.dungeon, TILE_BOSS).length == 0) {
         return 'level completed';
       } else if (state.hero.health < 0) {
         return 'hero died'
       };
    }

    handleMove(event) {
      var game = this;
      var hero = this.state.hero;

      var nextState = {
        dungeon: JSON.parse(JSON.stringify(this.state.dungeon)),
        hero: JSON.parse(JSON.stringify(this.state.hero))
      };
      var oldX = hero.coord.x,
          oldY = hero.coord.y;

      function fightEnemy(newX, newY) {
        var { health, weapon } = game.state.enemies.find(e => e.x == newX && e.y == newY);
        var hit = Math.floor(Math.random() * (hero.fight ? hero.weapon * (1+hero.level/5): weapon));
        console.log('FIGHTING!!');

        if(hero.fight) {
          game.setState({
            enemies: game.state.enemies.map(e => {
              if (e.x == newX && e.y == newY) {
                return {
                  health: health - hit,
                  weapon : weapon,
                  x: newX,
                  y: newY
                };
              } else {
                return e;
              }})
          });
          game.createMessage(`Fighting, enemy gets hit (-${hit})`);
        } else {
          nextState.hero.health -= hit;
          game.createMessage(`Fighting, hero gets hit (-${hit})`);
        }

        nextState.hero.fight = !hero.fight;
        return health <= 0;
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

        // check out of boundary
        if( newX >= nextState.dungeon.length || newX < 0 ||
            newY >= nextState.dungeon[newX].length || newY < 0 ) {
              console.log('leaving worldmap');
              return;
        }

        var object = nextState.dungeon[newX][newY];
        switch (object) {
          case TILE_EMPTY:
            moveHero();
            break;
          case TILE_WALL: case TILE_SINGLE:
            game.createMessage(`You're hitting ${TILES[object]} dude ...`);
            break;
          case TILE_HEALTH:
            game.createMessage(`Found a medi-kit, health improved ...`, LOGLEVEL_INFO);
            nextState.hero.health += 20;
            nextState.hero.level += 1;
            moveHero();
            break;
          case TILE_WEAPON:
            game.createMessage(`Found a new weapon, let's get some fight ...`, LOGLEVEL_INFO);
            nextState.hero.weapon += 7;
            nextState.hero.level += 2;
            moveHero();
            break;
          case TILE_BOSS:
          case TILE_ENEMY:
            if(fightEnemy(newX, newY)) {
              moveHero();
              nextState.hero.level += 3;
              game.createMessage('WON against enemy', LOGLEVEL_INFO);
              var checkNextAction = game.finishedDungeon(nextState);
              if(checkNextAction == 'level completed') {
                  game.createMessage(`Level ${game.state.level} completed, move on ...`, LOGLEVEL_INFO);
                  var nextLevel = game.state.level+1;
                  nextState.hero.level += 7; // 3+7 = 10 for level complete
                  var nextDungeon;
                  nextDungeon = game.generateMap(nextLevel);

                  nextState.dungeon = nextDungeon.dungeon;
                  nextState.hero.coord = nextDungeon.hero.coord;
                  game.setState({
                    level: nextLevel,
                    enemies: nextDungeon.enemies
                  });

                  document.removeEventListener("keydown", game.handleMove);
                  document.addEventListener("keydown", game.handleMove);
                  console.log('moving to next level', game.state);
              } else if (checkNextAction == 'hero died') {
                this.addMessage(`You died ...`);
                document.removeEventListener("keydown", game.handleMove);
              } else if (checkNextAction == 'finished') {
                game.createMessage('CONGRATULATION!!! You finished all dungeons', LOGLEVEL_INFO);
                nextDungeon = {
                  dungeon: nextState.dungeon,
                  hero: nextState.hero
                };
                game.setState({
                  dungeon: nextState.dungeon,
                  hero: nextState.hero,
                  peek: true
                });
                nextLevel = game.state.level;
                document.removeEventListener("keydown", game.handleMove);
                return;
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
      this.setState({
        dungeon: nextState.dungeon,
        hero: nextState.hero
      });
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
      function applyRandomMapCss() {
        var cssArray = ['./css/map-gras.css', './css/map-rock.css', './css/map-sand.css'];
        console.log($('link#map').attr('href'));
        $("link#map").attr("href",cssArray[Math.round(Math.random() * cssArray.length)]);
      }

      var gamemap = this.props.dungeons[level];
      if(gamemap == undefined) {
        throw new Error(`no world specified for level ${level}`);
      }

      applyRandomMapCss();
      // console.log(`selected dungeon ${level}\n${gamemap.map(row => row.join(',')).join('\n')}`);
      this.placeTileOnMap(gamemap, TILE_HERO);
      for(var i=0; i< 3; i++) {
        this.placeTileOnMap(gamemap, TILE_ENEMY);
      }
      this.placeTileOnMap(gamemap, TILE_HEALTH);
      this.placeTileOnMap(gamemap, TILE_WEAPON);
      this.placeTileOnMap(gamemap, TILE_BOSS);
      return {
        dungeon: gamemap,
        hero: {
          coord: this.findTileInMap(gamemap, TILE_HERO)[0],
          health: 100,
          weapon: 7,
          fight: true,
          level: 1,
          experience: 0
        },
        enemies: this.findTileInMap(gamemap, TILE_ENEMY).map(e => {return {
            x: e.x,
            y: e.y,
            health: 10 *(1+level),
            weapon: 7 *(1+level)
          };
        }).concat(this.findTileInMap(gamemap, TILE_BOSS).map(e => {return {
            x: e.x,
            y: e.y,
            health: 20 *(1+level),
            weapon: 14 *(1+level)
          };
        }))
      };
    }

    render() {
      var currentDungeon = this.state.dungeon;
      var {peek, hero} = this.state;
      var {visibleRadius} = this.props;
      function isRowVisible(row) {
        if(peek) return true;
        return (row >= hero.coord.x - visibleRadius)
          && (row <= hero.coord.x + visibleRadius);
      }
      function isTileVisible (x, y) {
        if(!peek) {
          var xMin = hero.coord.x - visibleRadius,
              xMax = hero.coord.x + visibleRadius,
              yMin = hero.coord.y - visibleRadius,
              yMax = hero.coord.y + visibleRadius;
          return (x >= xMin && x <= xMax) && (y >= yMin && y <= yMax);
        }
        return true;
      }

      return (
        <div className="container">
          <div className="row">
            <h2 className="col-xs-offset-2 col-xs-8 text-center">Dungeon Level {this.state.level}</h2>
            <HeroInfo classes="col-xs-offset-2 col-xs-8 row"
              health={hero.health}
              weapon={hero.weapon}
              level={hero.level} />
            <Controls classes="col-xs-offset-2 col-xs-8 row"
              peek={this.state.peek}
              onPeekToggle={this.peekToggle}
              onAckAll={() => this.ackMessage()} />
          </div>
          <div className="dungeon row">
          {currentDungeon.map( (row, y) =>
            <div className={isRowVisible(y) ? 'tile-row' : 'blackedout'}>
             { row.map((value, x) =>
               <Tile coord={[x,y]} type={value} visible={isTileVisible(y,x)}/>
             )}
            </div>
          )}
          </div>
          <div className="row">
            <div className="col-xs-offset-2 col-xs-8">
              <MessageBox messages={this.state.messages} handleAck={this.ackMessage}/>
            </div>
          </div>
        </div>
      );
    }
}

Game.propTypes = {
  visibleRadius: React.PropTypes.number.isRequired,
  logLevel: React.PropTypes.number.isRequired,
  startLevel: React.PropTypes.number.isRequired
}
Game.defaultProps = {
  visibleRadius: 3,
  logLevel: LOGLEVEL_INFO,
  startLevel: 0,
  dungeons: [
    [
      [ 1,10,10,10,10,10,1 ,1 ,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10, 1],
      [ 9, 0, 0, 0, 0, 0,14,15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
      [ 9, 0, 0, 0, 0, 0, 0, 0, 0,12,13, 0, 0, 0, 0, 0,12,13, 0, 0, 0, 0, 0, 8],
      [ 9, 0, 0, 0, 0, 0,12,11,11, 1, 9, 0, 0, 0, 0, 0, 8, 9, 0, 0, 0, 0, 0, 8],
      [ 9, 0, 0, 0, 0, 0,14,10,10,10, 1,11,11,11,11,11, 1, 1,11,11,11,11,11, 1],
      [ 9, 0, 0, 0, 0, 0, 0, 0, 0, 0,14,10, 1, 1,10,10, 1, 1,10,10, 1, 1,10, 1],
      [ 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 9, 0, 0, 8, 9, 0, 0, 8,15, 0, 8],
      [ 9, 0, 0, 0,12,11,13, 0, 0, 0, 0, 0,14,15, 0, 0,14,15, 0,12, 9, 0, 0, 8],
      [ 9, 0, 0, 0,14,10,10,11,11,11,13, 0, 0, 0, 0, 0, 0, 0, 0, 8, 9, 0,12, 1],
      [ 9, 0, 0, 0, 0, 0, 0,14,10,10,15, 0, 0, 0, 0, 0,12,13, 0,14,15, 0,14, 1],
      [ 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 9, 0, 0, 0, 0, 0, 8],
      [ 9, 0,12,11,11,11,11,11,11,11,11,11,11,11,13, 0, 8, 1,11,13, 0, 0, 0, 8],
      [ 9, 0,14,10,10,10, 1, 1,10,10,10,10,10, 1, 9, 0, 8, 1, 1, 9, 0, 0, 0, 8],
      [ 9, 0, 0, 0, 0, 0, 8, 9, 0, 0, 0, 0, 0, 8, 9, 0, 8, 1, 1, 9, 0, 0, 0, 8],
      [ 9, 0, 0, 0, 0, 0,14,15, 0, 0, 0, 0, 0, 8, 9, 0,14,10,10,15, 0, 0, 0, 8],
      [ 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 9, 0, 0, 0, 0, 0, 0, 0, 0, 8],
      [ 1,11,11,11,11,11,11,11,11,11,11,11,11, 1, 1,11,11,11,11,11,11,11,11, 1],
    ],
    [
      [ 1,10,10,10,10, 1, 1,10,10,10,10,10,10,10,10,10,10,10,10,10,10, 1, 1, 1,10,10,10,10,10, 1],
      [ 9, 0, 0, 0, 0, 8, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 1, 9, 0, 0, 0, 0, 0, 8],
      [ 9, 0, 0, 0, 0, 8, 9, 0, 0, 7, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 8, 1, 9, 0, 0, 0, 0, 0, 8],
      [ 9, 0, 0, 0, 0, 8, 9, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,14,10,15, 0, 0, 0, 0, 0, 8],
      [ 9, 0, 0, 0, 0, 8, 9, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 12,13,0, 0, 0, 0, 0,12,11,13, 0, 8],
      [ 9, 0, 0, 0, 0, 8, 9, 0, 0, 0, 7, 0, 0, 0,12,13, 0, 0, 14, 1,13, 0, 0, 0, 0, 8, 1, 9, 0, 8],
      [ 1,13, 0,12,11,10,15, 0, 0, 0, 0, 0, 0, 0, 8, 9, 0, 0, 0, 8, 9, 0, 0, 0, 0,14,10,15, 0, 8],
      [ 1, 9, 0,14,15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 9, 0,12,11, 1,15, 0, 0, 0, 0, 0, 0, 0, 0, 8],
      [ 1,15, 0, 0, 0, 0,12,11,13, 0, 0, 0, 0, 0,14,10,10,10, 1, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
      [ 9, 0, 0, 0, 0, 0,14,10, 1,13, 0, 0, 0, 0, 0, 0, 0, 0, 8, 1,11,11,11,11,11,13, 0, 0,12, 1],
      [ 1,13, 0, 0, 0, 0, 0, 0, 8, 1,11,11,11,11,11,13, 0, 0, 8, 1, 1, 1, 1, 1, 1, 9, 0, 0,14, 1],
      [ 1,10,11,11,11,13, 0, 0,14,10,10,10,10,10,10,15, 0, 0, 8, 1, 1, 1, 1, 1, 1, 9, 0, 0, 0, 8],
      [ 9, 0,14,10,10,15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 1, 1, 1, 1,10,10,15, 0, 0, 0, 8],
      [ 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 1, 1, 1, 9, 0, 0, 0, 0, 0, 0, 8],
      [ 1,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11, 1, 1, 1, 1, 1,11,11,11,11,11,11, 1],
      // [ 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
    ]
  ]
}

ReactDOM.render(
  <Game startLevel={1}/>,
  document.getElementById('app')
);
