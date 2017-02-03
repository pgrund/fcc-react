class Recipe extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      title: props.new ? '' : props.recipe.title,
      ingredients: props.new ? [] : props.recipe.ingredients,
      editable: props.new ? true : false
    }

    this.changeTitle = this.changeTitle.bind(this);
    this.changeIngredients = this.changeIngredients.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
  }

  handleDelete() {
    this.setState({editable: this.props.new });
    this.props.onDelete(this.props.id);
  }
  handleSubmit() {
    this.setState({editable: this.props.new });
    if(this.props.new) {
      this.props.onCreate({
        title: this.state.title,
        ingredients: this.state.ingredients
      });
      this.setState({
        title: '',
        ingredients: [],
        editable: true
      });
    } else {
      this.props.onUpdate({
        title: this.state.title,
        ingredients: this.state.ingredients
      }, this.props.id);
    }
  }

  changeTitle(evt) {
    this.setState({title: evt.target.value});
  }

  changeIngredients(evt) {
    this.setState({ingredients: evt.target.value.split(',')});
  }

  toggleEdit() {
    this.setState({editable: true});
  }

  render() {
    let item ;
    if(this.state.editable) {
      item = (
        <div>
          <input type="text" value={this.state.title} onChange={this.changeTitle}/>
          <input type="text" value={this.state.ingredients.join(',')} onChange={this.changeIngredients} />
          <button onClick={this.handleSubmit}>{this.props.new ? 'add' :'submit'}</button>
          <button onClick={this.handleDelete}>delete</button>
        </div>
      );
    } else {
      item = (<p className="title" onDoubleClick={this.toggleEdit}>{this.state.title}</p>);
    }
    return (
      <div className={"item" + (this.state.editable ? " edit": "")}>
        { item }
      </div>
    );
  }
}
Recipe.propTypes = {
  recipe: React.PropTypes.object.isRequired,
  id: React.PropTypes.number,
  onCreate: React.PropTypes.func.isRequired,
  onUpdate: React.PropTypes.func.isRequired,
  onDelete: React.PropTypes.func.isRequired
};


class RecipeBox extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      recipes: props.recipes
    };

    this.updateRecipe = this.updateRecipe.bind(this);
    this.deleteRecipe = this.deleteRecipe.bind(this);
    this.createRecipe = this.createRecipe.bind(this);
    this.storeRecipes = this.storeRecipes.bind(this);
  }

  deleteRecipe(idx) {
    this.storeRecipes(this.state.recipes.filter((r, i) =>  i != idx ));
  }
  createRecipe(recipe) {
    this.storeRecipes(this.state.recipes.concat(recipe));
  }
  updateRecipe(recipe, idx) {
    this.storeRecipes(this.state.recipes.map( (r, i)  => ( i == idx ? recipe : r ) ));
  }
  storeRecipes(updated) {
    this.setState({recipes: updated});
    this.props.onStore(updated);
  }

  render() {
    return (
      <div>
        <Recipe new id={this.state.recipes.length} onCreate={this.createRecipe} />
        <hr/>
        { this.state.recipes.map ((recipe, idx) =>
              <Recipe recipe={recipe} id={idx}
                onUpdate={this.updateRecipe}
                onDelete={this.deleteRecipe}
              />
        )}
      </div>
    );
  }
};

RecipeBox.propTypes = {
  recipes: React.PropTypes.array.isRequired
};

function store(recipes) {
  if(recipes) {
    localStorage.setItem('myRecipes', JSON.stringify(recipes));
  }
  let stored = localStorage.getItem('myRecipes');
  stored = (stored ? JSON.parse(stored) : []);
  return stored;
}

ReactDOM.render(
  <RecipeBox recipes={store()} onStore={store} />,
  document.getElementById('app')
);
