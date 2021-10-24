import React, {useEffect, useState, createContext} from 'react'
import axios from 'axios';
import { withRouter } from 'react-router-dom';
export const userContext = createContext()

function UserContext(props) {

    const [user, setUser] = useState([]);

    useEffect(() => {
        if(!localStorage.getItem('accessToken')) {
            return false;
        }
        const config = {
			headers: {
				x_access_token: localStorage.getItem('accessToken')
			}
		}
        axios.get("/users/account", config).then(response=>{
            setUser(response.data);
        }).catch(err => {
            console.log(err);
        })
    }, [props])


    return (
        <userContext.Provider value={user}>
            {props.children}
        </userContext.Provider>
    )
}

export default withRouter(UserContext)