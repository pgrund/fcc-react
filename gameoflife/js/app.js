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
    let next = [];
    for(let i = 0; i < this.props.dimension; i++) {
      let row = [];
      for(let j=0; j < this.props.dimension; j++) {
        row.push(!this.state.cells[i][j]);
      }
      next.push(row);
    };
    this.setState({
      generation: (this.state.generation+1),
      cells: next
    });
  }

  handleRun() {
    this.setState({
      timer: setInterval(this.nextIteration, 2000)
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
      <div className="game ">
       {this.state.cells.map (row => renderRow(row))}
       <div>
         <span>Generation: {this.state.generation}</span>
       </div>
       <div className="buttons">
         <button onClick={this.nextIteration}>next</button>
         <button onClick={this.handleRun}>run</button>
         <button onClick={this.handlePause}>pause</button>
         <button onClick={this.handleClear}>clear</button>
       </div>
      </div>
    );
  }
}
Game.propTypes = {
  dimension: React.PropTypes.number.isRequired
}
Game.defaultProps = {
  dimension: 5
}

ReactDOM.render(
  <Game />,
  document.getElementById('app')
);
