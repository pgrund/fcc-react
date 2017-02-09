class TextInput extends React.Component  {
    constructor(props) {
      super(props);
      this.state = {
        text: props.text,
        edit: props.edit
      };

      this.handleChange = this.handleChange.bind(this);
      this.toggleEdit = this.toggleEdit.bind(this);
    }

    handleChange(evt) {
      const changed = evt.target.value;
      this.setState({
        text: changed
      });
      this.props.onSave(changed);
    }

    toggleEdit() {
      this.setState({
        edit: !this.state.edit
      });
    }

    render() {
      if(this.state.edit) {
        return (
          <input type="text" value={this.state.text}
            className={this.props.classes}
            placeholder={this.props.placeholder}
            onChange={this.handleChange}
            onBlur={this.toggleEdit} />
          );
      }
      return (
        <span onDoubleClick={this.toggleEdit}>
          {this.state.text} {this.props.children}
        </span>
      );
    }
}
TextInput.propTypes = {
  text: React.PropTypes.string.isRequired,
  onSave: React.PropTypes.func.insRequired,
  placeholder: React.PropTypes.string,
  classes: React.PropTypes.string
}

TextInput.defaultProps = {
  text: '',
  placeholder: 'Insert text here ...',
  classes: 'form-control',
  edit: false
}

class RecipeEdit extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      title: props.title,
      ingredients: props.ingredients,
      single:''
    };

    this.handleTitle = this.handleTitle.bind(this);
    this.addIngredient = this.addIngredient.bind(this);
    this.handleIngredient = this.handleIngredient.bind(this);
    this.handleSingle = this.handleSingle.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleTitle(text) {
    // console.log('update title in recipeedit', this.state.title, text);
    this.setState({
      title: text
    });
  }
  handleIngredient(idx) {
    return function(evt) {
        this.setState({
          ingredients: this.state.ingredients.map((ingredient, index) => idx == index ? evt.target.value: ingredient)
        });
    }
  }
  handleSingle(evt) {
    this.setState({
      single: evt.target.value
    });
  }
  addIngredient(evt) {
    const updated = this.state.ingredients.concat(this.state.single);
    this.setState({
      ingredients: updated,
      single: ''
    });
  }

  handleDelete() {
    this.props.onDelete(this.props.id);
  }
  handleSubmit() {
    // console.log('submit ...', this.state, this.props.id);
    this.props.onSave({
      title: this.state.title,
      ingredients: this.state.ingredients
    }, this.props.id)
  }

  handleReset() {
    this.setState({
      title: this.props.title,
      ingredients: this.props.ingredients
    });
  }

  render() {
    let buttons = (
      <div>
        <button className="btn btn-success" onClick={this.handleSubmit}>
          <span className="glyphicon glyphicon-ok" title="submit" />
        </button>
        <button className="btn btn-danger" onClick={this.handleDelete}>
          <span className="glyphicon glyphicon-trash" title="delete" />
        </button>
      </div>
    );
    if(this.props.new) {
      buttons = (
        <div>
          <button className="btn btn-success" onClick={this.handleSubmit}>
          	<span className="glyphicon glyphicon-plus" title="add" />
          </button>
          <button className="btn btn-danger" onClick={this.handleReset}>
            <span className="glyphicon glyphicon-ban-circle" title="cancel" />
          </button>
        </div>
      );
    }
    return (
          <div className="row col-xs-12">
            <div className="form-group row col-xs-6">
              <label for="title" className="col-xs-4">title</label>
              <TextInput id="title" text={this.state.title}
              classes="col-xs-8"
              onSave={this.handleTitle}
              edit={this.props.new}
              placeholder="how to call your recipe ..." />
            </div>
            <div className="form-group row col-xs-6">
            <label for="ingredients" className="col-xs-4">ingredients</label>
            {this.state.ingredients.map( (ing, idx) =>
              <TextInput id={"ing-"+idx}
                text={ing}
                classes='col-xs-8'
                onSave={this.handleIngredient(idx)}>, </TextInput>
            )}
            </div>
            <div className="form-group row col-xs-offset-6 col-xs-6">
             <div className="input-group">
              <span className="input-group-btn">
                <button className="btn-success btn"
                  onClick={this.addIngredient}>
                  <span className="glyphicon glyphicon-plus" title="add" />
                </button>
              </span>
              <input type="text" value={this.state.single}
                className="form-control"
                placeholder="single ingredient"
                onChange={this.handleSingle}/>
            </div>
          </div>
            {buttons}
          </div>
        );
  }
}
RecipeEdit.props = {
  id: React.PropTypes.number,
  title: React.PropTypes.string.isRequired,
  ingredients: React.PropTypes.array.isRequired,
  onSave: React.PropTypes.func.isRequired,
  onDelete: React.PropTypes.func
}
RecipeEdit.defaultProps = {
  title: '',
  ingredients: []
}

class Recipe extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      recipe: props.recipe
    }
    this.toggleEdit = this.toggleEdit.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleLocalDelete = this.handleLocalDelete.bind(this);
  }

  handleLocalDelete(evt) {
    this.handleDelete(evt.target.value);
  }
  handleDelete(id) {
    console.log(id == this.props.id, id, this.props.id);
    this.props.onDelete(this.props.id);
  }
  handleSubmit(updated) {
    console.log('submit in recipe', updated);
    this.setState({
      recipe :{
        title: updated.title,
        ingredients: updated.ingredients
      },
      edit: false
    });
    this.props.onSave(updated, this.props.id);
  }

  toggleEdit() {
    this.setState({edit: true});
  }

  render() {
    if(this.state.edit) {
      return (
        <div className="row col-xs-12">
          <h4 className="title col-xs-12" style={{textTransform: 'capitalize'}}>{this.state.recipe.title}</h4>
          <RecipeEdit
            id={this.props.id}
            title={this.state.recipe.title}
            ingredients={this.state.recipe.ingredients}
            onDelete={this.handleDelete}
            onSave={this.handleSubmit} />
        </div>
      );
    }
    return (
      <div className="row">
        <h4 className="col-sm-3"
         onClick={this.toggleEdit}>
          {this.state.recipe.title}
        </h4>
        <div className="col-sm-9 text-right">
          <button className="btn btn-success" onClick={this.toggleEdit}>
            <span className="glyphicon glyphicon-pencil" title="edit" />
          </button>
          <button className="btn btn-danger" onClick={this.handleLocalDelete} value={this.props.id} >
            <span className="glyphicon glyphicon-trash" title="delete" />
          </button>
        </div>
      </div>
    );
  }
}
Recipe.propTypes = {
  recipe: React.PropTypes.object.isRequired,
  id: React.PropTypes.number,
  onSave: React.PropTypes.func.isRequired,
  onDelete: React.PropTypes.func.isRequired
};


class RecipeBox extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      recipes: props.recipes,
      addRecipe: false
    };

    this.updateRecipe = this.updateRecipe.bind(this);
    this.deleteRecipe = this.deleteRecipe.bind(this);
    this.createRecipe = this.createRecipe.bind(this);
    this.storeRecipes = this.storeRecipes.bind(this);
    this.toggleNew = this.toggleNew.bind(this);
  }

  deleteRecipe(idx) {
    this.storeRecipes(this.state.recipes.filter((r, i) =>  i != idx ));
  }
  createRecipe(recipe) {
    this.setState({
      addRecipe: false
    });
    this.storeRecipes(this.state.recipes.concat(recipe));
  }
  updateRecipe(recipe, idx) {
    this.storeRecipes(this.state.recipes.map( (r, i)  => ( i == idx ? recipe : r ) ));
  }
  storeRecipes(updated) {
    this.setState({recipes: updated});
    this.props.onStore(updated);
  }
  toggleNew() {
    this.setState({
      addRecipe: true
    });
  }

  render() {
    let addAnother = (
        <button className="btn btn-warning" onClick={this.toggleNew}>new</button>
    );
    if(this.state.addRecipe) {
      addAnother = (
        <RecipeEdit new onSave={this.createRecipe} />
      );
    }
    return (
      <div className="container">
        <div className="row col-xs-12">
          {addAnother}
        </div>
        { this.state.recipes.map ((recipe, idx) =>
            <Recipe id={idx}
                recipe={recipe}
                onSave={this.updateRecipe}
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
    localStorage.setItem('_pgrund_recipes', JSON.stringify(recipes));
  }
  let stored = localStorage.getItem('_pgrund_recipes');
  stored = (stored ? JSON.parse(stored) : []);
  return stored;
}

ReactDOM.render(
  <RecipeBox recipes={store()} onStore={store} />,
  document.getElementById('app')
);
