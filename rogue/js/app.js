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
      </ul>
    );
  }
}
Info.propTypes = {
  TILE_HEALTH: React.PropTypes.number.isRequired,
  TILE_WEAPON: React.PropTypes.number.isRequired,
  level: React.PropTypes.number.isRequired
}

class Game extends React.Component {
    constructor(props) {
      super(props);
      var map = this.generateMap();
      this.state = {
        peek: false,
        worldmap: map,
        hero: {
          coord: this.findTileInMap(map, TILE_HERO)[0],
          health: 100,
          weapon: 7,
          level: 0
        },
        enemies: this.findTileInMap(map, TILE_ENEMY).map(e => {return {
          x: e.x,
          y: e.y,
          health: 10,
          weapon: 7
        };})
      };

      this.generateMap = this.generateMap.bind(this);
      this.findTileInMap = this.findTileInMap.bind(this);
      this.placeTileOnMap = this.placeTileOnMap.bind(this);
      this.handleMove = this.handleMove.bind(this);
      this.fightEnemy = this.fightEnemy.bind(this);
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
      if(res.length == 0) throw new Error('no hero in worldmap found');
      return res;
    }

    fightEnemy(newX, newY) {

      var hero = this.state.hero;
      var enemy = this.state.enemies.find(e => e.x == newX && e.y == newY);

      hero.health -= Math.floor(Math.random() * enemy.weapon);
      enemy.health -= Math.floor(Math.random() * hero.weapon);

      this.setState({
        enemies: this.state.enemies.map(e => e == enemy ? enemy : e)
      });
      if(enemy.health <= 0) {
        hero.coord.x = newX;
        hero.coord.y = newY;
      }
      this.setState({
        hero: hero
      });
      return enemy.health <= 0;
    }

    handleMove(event) {
      var fightEnemy = this.fightEnemy;
      var hero = this.state.hero;
      var nextMap = this.state.worldmap.map(row => row.map(cell => cell));
      function moveTo(dx, dy) {
        var oldX = hero.coord.x,
            oldY = hero.coord.y,
            newX = hero.coord.x + dx,
            newY = hero.coord.y + dy;
        // check out of boundary
        if( hero.coord.x + dx >= nextMap.length || hero.coord.x + dx < 0 ||
            hero.coord.y + dy >= nextMap[0].length || hero.coord.y + dy < 0 ) {
              console.log('leaving worldmap');
              return;
        }

        switch (nextMap[newX][newY]) {
          case TILE_EMPTY:
            hero.coord = {
              x : newX,
              y : newY
            };
            nextMap[oldX][oldY] = TILE_EMPTY;
            nextMap[newX][newY] = TILE_HERO;
            break;
          case TILE_WALL:
            console.log('bang your head !!!');
            break;
          case TILE_HEALTH:
            console.log('picked up TILE_HEALTH');
            hero.health += 20;
            hero.coord = {
              x : newX,
              y : newY
            };
            nextMap[oldX][oldY] = TILE_EMPTY;
            nextMap[newX][newY] = TILE_HERO;
            break;
          case TILE_WEAPON:
            console.log('picked up TILE_WEAPON');
            hero.weapon += 7;
            hero.coord = {
              x : newX,
              y : newY
            };
            nextMap[oldX][oldY] = TILE_EMPTY;
            nextMap[newX][newY] = TILE_HERO;
            break;
          case TILE_ENEMY:
            if(fightEnemy(newX, newY)) {
              nextMap[oldX][oldY] = TILE_EMPTY;
              nextMap[newX][newY] = TILE_HERO;
            }
            break;
          default:
            console.log('unknown', nextMap[newX][newY]);
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
        worldmap: nextMap,
        TILE_HERO: TILE_HERO
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
    generateMap() {
      var gamemap = this.emptyMapWithWalls();
      this.placeTileOnMap(gamemap, TILE_HERO);
      for(var i=0; i< 3; i++) {
        this.placeTileOnMap(gamemap, TILE_ENEMY);
      }
      this.placeTileOnMap(gamemap, TILE_HEALTH);
      this.placeTileOnMap(gamemap, TILE_WEAPON);
      return gamemap;
    }
    emptyMapWithWalls() {
      return [
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
      ];
    }
    render() {
      var worldmap = this.state.worldmap;
      return (
        <div>
          <h3>Game</h3>
          <Info health={this.state.hero.health}
            weapon={this.state.hero.weapon}
            level={this.state.hero.level}/>
          <div className="worldmap">
          {worldmap.map( (row, y) =>
            <div className="tilerow">
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
  titleDimension: React.PropTypes.array.isRequired,
  screenDimension: React.PropTypes.array.isRequired,
  visibleRadius: React.PropTypes.number.isRequires
}
Game.defaultProps = {
  titleDimension: [1,1],
  screenDimension: [80, 80],
  visibleRadius: [12]
}

ReactDOM.render(
  <Game />,
  document.getElementById('app')
);
