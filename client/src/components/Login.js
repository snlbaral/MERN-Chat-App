import React, { useState, useEffect } from 'react'
import axios from 'axios';
import $ from 'jquery'
import { Link } from 'react-router-dom';

function Login(props) {

    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [error, setError] = useState(null)
    const [errors, setErrors] = useState([])

    useEffect(() => {
        if(localStorage.getItem('accessToken')) {
            props.history.push("/");
        }
    }, [props])

    function submitMe(e) {
        e.preventDefault();
        const data = {
            username: username,
            password: password,
        }
        axios.post('/users/login', data).then(response=>{
            localStorage.setItem('accessToken', response.data);
            props.history.push("/");
            $('.btn-primary').prop('disabled',false)
        }).catch(err=>{
            try {
                setError(null)
                setErrors(JSON.parse(err.request.response))
            } catch {
                setErrors([])
                setError(err.request.response)
            }
            $('.btn-primary').prop('disabled',false)
        })
    }


    return (
        <div className="container-fluid py-5">
        {errors && errors.length>0 ?
            (
                errors.map(err=>{
                    return(
                        <div className="alert alert-danger text-capitalize">{err.message}</div>
                    )
                })
            )
            :(null)}
            {error ?
            (
                <div className="alert alert-danger text-capitalize">{error}</div>
            )
            :(null)}
            <form onSubmit={(e) => submitMe(e)}>
                <div className="form-group">
                    <label htmlFor="exampleInputEmail1">Username</label>
                    <input type="text" className="form-control" placeholder="Enter Username" onChange={(e) => setUsername(e.target.value)}/>
                </div>
                <div className="form-group">
                    <label htmlFor="exampleInputPassword1">Password</label>
                    <input type="password" className="form-control" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="form-group">
                    <button type="submit" className="btn btn-primary">Submit</button>
                </div>
                <div className="form-group">
                    <Link to="/register" className="btn btn-info">Register</Link>
                </div>
            </form>
        </div>
    )
}

export default Login
