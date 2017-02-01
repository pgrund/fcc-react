/*
  ################ Presentation Components
*/
var Spinner = React.createClass({
  render: function() {
    return (this.props.show ? (<div className='alert alert-warning' role="alert">
      <p>Loading ...</p>
      <span className='glyphicon glyphicon-refresh' />
    </div>) : <span />);
  }
});

var Button = React.createClass({
  render: function() {
    return (
      <span className={"" + (this.props.show ? "" :"bg-primary" )}>
        {this.props.children}
        {(this.props.show ? (<button onClick={this.props.handleClick}><span className="glyphicon glyphicon-share-alt"/></button>) : '')}
      </span>
    );
  }
});

/*
  ################ Container Components
*/
    var Header = React.createClass({
      render: function() {
        return (
        <thead>
         <tr>
          <th className="col-xs-1">#</th>
          <th className="col-xs-5">
            <span>Camper</span>
          </th>
          <th className="col-xs-3">
            <Button handleClick={this.props.handleClick} show={this.props.selected == 'alltime'}>
              Points in last 30 days
            </Button>
          </th>
          <th className="col-xs-3">
            <Button handleClick={this.props.handleClick} show={this.props.selected == 'recent'}>
              Alltime Points
            </Button>
          </th>
        </tr>
        </thead>
        );
      }
    });

    var LeaderboardContainer = React.createClass({
      links: {
        recent: 'https://fcctop100.herokuapp.com/api/fccusers/top/recent',
        alltime: 'https://fcctop100.herokuapp.com/api/fccusers/top/alltime'
      },
      toggleSelection: function() {
        var nextState = (this.state.selection == 'recent' ? 'alltime' : 'recent');
        this.getUsers(nextState);
      },
      getInitialState: function() {
        return {
          users : [],
          selection: 'recent',
          inProgress: true,
        };
      },

      componentDidMount: function() {
        this.getUsers(this.state.selection);
      },
      getUsers: function( state ) {
        console.log('remote call for users of', state);
        var _this = this;
        this.setState({
          inProgress: true,
        });
        this.serverRequest = fetch(new Request(this.links[state]))
          .then(function(response) {
            if(response.ok) {
              return response.json()
                .then(function(json) {
                  _this.setState({
                    selection: state,
                    users: json,
                    inProgress: false
                  });
                });
              } else {
                // no successfull call, but feedback from API
                _this.setState({inProgress: false});
                console.error(response.status, response.statusText);
              }
          })
          .catch(function(error){
              _this.setState({inProgress: false});
              console.error("Error during fetch:",error);
          });
      },

      componentWillUnmount: function() {
         this.serverRequest.abort();
         this.setState({inProgress: false});
       },

      render: function() {
        var imgStyle = {
          width: 20,
          height: 20,
          padding: 5,
          borderRadius: 5,
          border: 'solid thin black',
          boxShadow: '3px 2px darkgray'
        };
        var userItems = this.state.users.map(function(user, idx) {
          return (
            <tr className='user'>
              <td>{idx+1}</td>
              <td className="text-left">
                <img src={user.img} />
                <span className='name'>{user.username}</span>
              </td>
              <td>{user.recent}</td>
              <td>{user.alltime}</td>
            </tr>
          );
        });

        return (
          <div className="container">
            <Spinner show={this.state.inProgress} />
            <table className="table table-striped table-hover">
              <Header selected={this.state.selection} handleClick={this.toggleSelection} />
              <tbody>
                {userItems}
              </tbody>
            </table>
          </div>
        );
      }
    });

    ReactDOM.render(
      <LeaderboardContainer />,
      document.getElementById('app')
    );
