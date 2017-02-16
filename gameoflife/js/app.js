class Cell extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
      return (
      <div className={"cell " + this.props.changed}>
        <span className={"glyphicon" + (this.props.alive ? ' glyphicon-user': '')}
        title={this.props.alive}></span>
      </div>
    );
  }
}
Cell.propTypes = {
  alive: React.PropTypes.bool.isRequired
}

class Game extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      cells : this.generateCells(this.props.dimension),
      generation: 0,
      timer: false,
      message: ''
    }

    this.generateCells = this.generateCells.bind(this);
    this.nextIteration = this.nextIteration.bind(this);

    this.handleClear = this.handleClear.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handleRun = this.handleRun.bind(this);
  }
  generateCells(dim) {
    return [...new Array(dim).keys()].map(row =>
      [...new Array(dim).keys()].map( ele =>
        (Math.random() < .5 ? 0 : 1)
      ));
  }

  nextIteration() {
    let _this = this;
    function getNeighborsAlive(i,j) {
      let amount = 0;
      for(let i1=i-1; i1 <= i+1; i1++) {
        for(let j1=j-1; j1 <= j+1; j1++) {
          if(i1 < 0 || j1 < 0 || i1 >= _this.props.dimension || j1 >= _this.props.dimension || (i==i1 && j==j1)) continue;
          if(_this.state.cells[i1][j1] > 0 )amount ++
        }
      }
      return amount;
    }
    function cellInNextIteration(neighbors, value) {
      switch (neighbors) {
        case 0: case 1:
            //Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
            if(value > 0) return -1;
        case 2:
            //Any live cell with two or three live neighbours lives on to the next generation.
            if(value > 0) {
              return 1;
            } else {
              return 0;
            }
        case 3:
            //Any live cell with two or three live neighbours lives on to the next generation.
            //Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
            if(value > 0) {
              return 1;
            } else {
              return 2;
            }
        default:
            //Any live cell with more than three live neighbours dies, as if by overpopulation.
            if(value > 0) {
              return -1;
            } else {
              return 0;
            }
      }
    }
    function noCellsLeft(arr) {
      return !arr.map(row => row.some(val => val)).some(val => val>0);
    }

    let next = [];
    for(let i = 0; i < this.props.dimension; i++) {
      let row = [];
      for(let j=0; j < this.props.dimension; j++) {
        row.push(cellInNextIteration(getNeighborsAlive(i,j), this.state.cells[i][j]));
      }
      next.push(row);
    };

    if(this.state.cells.every((row, i) => row.every((cell, j) => next[i][j] == cell)) &&
      next.every((row, i) => row.every((cell, j) => this.state.cells[i][j] == cell))) {
        this.setState({
          message: 'Staled state, no more changes in game ...'
        });
        this.handlePause();
    }
    this.setState({
      generation: (this.state.generation+1),
      cells: next
    });
    if(noCellsLeft(next)) {
      this.setState({
        message: 'No cells left in game ...'
      });
      this.handlePause();
    }
  }

  handleRun() {
    this.setState({
      timer: setInterval(this.nextIteration, this.props.interval * 1000),
      message: ''
    })
  }
  handlePause() {
    clearInterval(this.state.timer);
    this.setState({
      timer: false
    });
  }
  handleClear(){
    this.setState({
      cells : this.generateCells(this.props.dimension),
      generation: 0,
      message: ''
    });
  }

  render() {
    console.log(this.state.cells[0]);
    function renderRow(row) {
      function changed(val) {
        switch (val) {
          case 0:
            return 'dead';
          case 1:
            return 'alive';
          case -1:
            return 'died';
          case 2:
            return 'born';
          default:
            return 'unknown';
        }
      }
      return (
        <div className="cellRow">
          { row.map( cell =>
            <Cell alive={cell > 0} changed={changed(cell)}/>
          )}
        </div>
      );
    }
    return (
      <div className="game text-center">
       {this.state.cells.map (row => renderRow(row))}
       <div>
         <p>Generation: {this.state.generation}</p>
         <p className="message">{this.state.message}</p>
       </div>
       <div className="buttons">
         <button className="btn btn-success" onClick={this.handleRun} title="play">
           <span className="glyphicon glyphicon-play" />
         </button>
         <button className="btn btn-warning" onClick={this.handlePause} title="pause">
           <span className="glyphicon glyphicon-pause" />
         </button>
         <button className="btn btn-danger" onClick={this.handleClear} title="clear">
           <span className="glyphicon glyphicon-plus-sign" />
         </button>
       </div>
      </div>
    );
  }
}
Game.propTypes = {
  dimension: React.PropTypes.number.isRequired
}
Game.defaultProps = {
  dimension: 15,
  interval: 0.3
}

ReactDOM.render(
  <Game />,
  document.getElementById('app')
);
