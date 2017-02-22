const HERO  = 5,
      ENEMY = 4,
     WEAPON = 3,
     HEALTH = 2,
       WALL = 1,
      EMPTY = 0;

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
    var cell;
    switch (this.props.type) {
      case HERO:
        // hero
        cell = <div className="tile"><i className="fa fa-user text-sucess" /></div>;
        break;
      case ENEMY:
        // enemy
        cell = <div className="tile"><i className="fa fa-user-secret text-info" /></div>;
        break;
      case WEAPON:
        // weapon
        cell = <div className="tile"><i className="fa fa-legal text-success" /></div>;
        break;
      case HEALTH:
        // health
        cell = <div className="tile"><i className="fa fa-medkit text-danger" /></div>;
        break;
      case WALL:
        // wall
        cell = <div className="tile wall"/>;
        break;
      case EMPTY: default:
        // empty, default
        cell = <div className="tile empty" />;
        break;

    }
    return (this.state.visible ? cell : <div className="tile blackedout"/> );
  }
}
Tile.propTypes = {
  coord: React.PropTypes.array.isRequired,
  type: React.PropTypes.number.isRequired
}
Tile.defaultProps = {
  type: 0
}

class Game extends React.Component {
    constructor(props) {
      super(props);
      var map = this.generateMap();
      this.state = {
        peek: false,
        worldmap: map,
        hero: this.findHeroInMap(map)
      };

      this.generateMap = this.generateMap.bind(this);
      this.findHeroInMap = this.findHeroInMap.bind(this);
      this.placeTileOnMap = this.placeTileOnMap.bind(this);
      this.handleMove = this.handleMove.bind(this);
    }

    componentDidMount() {
      document.addEventListener("keydown", this.handleMove);
    }
    componentWillUnmount() {
      // document.removeEventListener("keydown");
    }

    findHeroInMap(gameMap) {
      for(let x = 0; x < gameMap.length; x++) {
        for(let y = 0; y < gameMap[0].length; y++) {
          if(gameMap[x][y] == HERO) {
            return { x: x, y: y};
          }
        }
      }
    }

    handleMove(event) {
      var hero = this.state.hero;
      var nextMap = this.state.worldmap.map(row => row.map(cell => cell));
      function moveTo(dx, dy) {
        var oldX = hero.x,
            oldY = hero.y,
            newX = hero.x + dx,
            newY = hero.y + dy;

        if( hero.x + dx >= nextMap.length || hero.x + dx < 0 ||
            hero.y + dy >= nextMap[0].length || hero.y + dy < 0 ) {
              console.log('leaving worldmap');
              return;
        }


        switch (nextMap[newX][newY]) {
          case EMPTY:
            hero.x = newX;
            hero.y = newY;
            nextMap[oldX][oldY] = EMPTY;
            nextMap[hero.x][hero.y] = HERO;
            break;
          case WALL:
            console.log('bang your head !!!');
            break;
          case HEALTH:
            console.log('picked up health');
            hero.x = newX;
            hero.y = newY;
            nextMap[oldX][oldY] = EMPTY;
            nextMap[hero.x][hero.y] = HERO;
            break;
          case WEAPON:
            console.log('picked up weapon');
            hero.x = newX;
            hero.y = newY;
            nextMap[oldX][oldY] = EMPTY;
            nextMap[hero.x][hero.y] = HERO;
            break;
          case ENEMY:
            console.log('FIGHT !!!!');
            hero.x = newX;
            hero.y = newY;
            nextMap[oldX][oldY] = EMPTY;
            nextMap[hero.x][hero.y] = HERO;
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
        hero: hero
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
      this.placeTileOnMap(gamemap, HERO);
      for(var i=0; i< 3; i++) {
        this.placeTileOnMap(gamemap, ENEMY);
      }
      this.placeTileOnMap(gamemap, HEALTH);
      this.placeTileOnMap(gamemap, WEAPON);
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
          <span>Game</span>
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
