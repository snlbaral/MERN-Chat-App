//import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Navbar from './globals/Navbar';
import UserContext from './globals/UserContext';
import Footer from './globals/Footer';
import Register from './components/Register';

axios.defaults.baseURL="https://snlbaral-chatapp.herokuapp.com/api";
//axios.defaults.baseURL='http://localhost:5000/api';

function App() {
  return (<>
    <Router>
    <UserContext>
        <Navbar />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
        </Switch>
        <Footer />
      </UserContext>
    </Router>
  </>);
}

export default App;
