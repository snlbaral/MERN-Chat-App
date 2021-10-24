import React, {useContext} from 'react'
import {userContext} from './UserContext';
import {Link, withRouter} from 'react-router-dom'

function Navbar(props) {
    const user = useContext(userContext)
    function logOut() {
        localStorage.removeItem("accessToken");
        props.history.push("/login");
    }

    return (
        <nav className="navbar navbar-dark bg-dark justify-content-between">
            <div className="navbar-brand text-warning font-weight-bold">Chat<h3 className="text-info font-weight-bold ml-1 d-inline-block">App</h3></div>
            <form className="form-inline">
            {localStorage.getItem('accessToken') ?
            (<>
                <div className="btn btn-outline-success my-2 my-sm-0">{user.name}</div>
                <div className="btn btn-outline-danger my-2 ml-2 my-sm-0" onClick={logOut}>Log Out</div>
            </>)
            :
            (<Link to="/login" className="btn btn-outline-info my-2 my-sm-0">Login</Link>)
            }
            </form>
        </nav>            
    )
}

export default withRouter(Navbar)
