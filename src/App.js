import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Home from './Components/Home';
import GuideLine from './Components/GuideLine';
import WorkingBoard from './Components/WorkingBoard';


function App() {
  return (
    <Router>
      <div className='App'>
        <Route path='/' exact component={Home} />
        <Route path='/guideline' component={GuideLine} />
        <Route path='/working_board' component={WorkingBoard} />
      </div>
    </Router>
  );
}

export default App;
