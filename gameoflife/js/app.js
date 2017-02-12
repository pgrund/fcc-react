class Cell extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="cell">
        <span className={"glyphicon" + (this.props.alive ? " glyphicon-user" : "")}
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
      timer: false
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
        Math.random() < .5
      ));
  }

  nextIteration() {
    let _this = this;
    function getNeighborsAlive(i,j) {
      let amount = 0;
      for(let i1=i-1; i1 <= i+1; i1++) {
        for(let j1=j-1; j1 <= j+1; j1++) {
          if(i1 < 0 || j1 < 0 || i1 >= _this.props.dimension || j1 >= _this.props.dimension || (i==i1 && j==j1)) continue;
          if(_this.state.cells[i1][j1])amount ++
        }
      }
      return amount;
    }
    function cellInNextIteration(neighbors, boolValue) {
      switch (neighbors) {
        case 0: case 1:
            //Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
            return false;
        case 2:
            //Any live cell with two or three live neighbours lives on to the next generation.
            return boolValue;
        case 3:
            //Any live cell with two or three live neighbours lives on to the next generation.
            //Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
            return true;
        default:
            //Any live cell with more than three live neighbours dies, as if by overpopulation.
            return false;
      }
    }
    function anyCellsLeft(arr) {
      return arr.map(row => row.some(val => val)).some(val => val);
    }

    let next = [];
    for(let i = 0; i < this.props.dimension; i++) {
      let row = [];
      for(let j=0; j < this.props.dimension; j++) {
        row.push(cellInNextIteration(getNeighborsAlive(i,j), this.state.cells[i][j]));
      }
      next.push(row);
    };

    this.setState({
      generation: (this.state.generation+1),
      cells: next
    });
    if(!anyCellsLeft(next)) {
      console.log("no cells left");
      this.handlePause();
    }
  }

  handleRun() {
    this.setState({
      timer: setInterval(this.nextIteration, this.props.interval * 1000)
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
      generation: 0
    });
  }

  render() {
    function renderRow(row) {
      return (
        <div className="cellRow">
          { row.map( boolValue =>
            <Cell alive={boolValue} />
          )}
        </div>
      );
    }
    return (
      <div className="game text-center">
       {this.state.cells.map (row => renderRow(row))}
       <div>
         <span>Generation: {this.state.generation}</span>
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
