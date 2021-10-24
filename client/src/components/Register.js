import React, { useState, useEffect } from 'react'
import axios from 'axios';
import $ from 'jquery'

function Register(props) {
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [name, setName] = useState(null);
    const [email, setEmail] = useState(null);
    const [error, setError] = useState(null)
    const [errors, setErrors] = useState([])

    useEffect(() => {
        if(localStorage.getItem('accessToken')) {
            props.history.push("/");
        }
    }, [props])

    function submitMe(e) {
        e.preventDefault()
        $('.btn-primary').prop('disabled',true)
        const data = {
            username,
            name,
            email,
            password
        }
        axios.post("/users/create", data).then(res=>{
            localStorage.setItem('accessToken', res.data);
            props.history.push("/");
            $('.btn-primary').prop('disabled',false)
        }).catch(err=>{
            console.log(err.request.response.indexOf("application/json"))
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
                        <input type="text" className="form-control" placeholder="Enter Username" onChange={(e) => setUsername(e.target.value)} required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="exampleInputEmail1">Email</label>
                        <input type="email" className="form-control" placeholder="Enter Username" onChange={(e) => setEmail(e.target.value)} required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="exampleInputEmail1">Full Name</label>
                        <input type="text" className="form-control" placeholder="Enter Username" onChange={(e) => setName(e.target.value)} required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="exampleInputPassword1">Password</label>
                        <input type="password" className="form-control" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required/>
                    </div>
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
            </div>
    )
}

export default Register
