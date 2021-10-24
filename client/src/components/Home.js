import React, { useState, useEffect, useContext, useRef } from 'react'
import {userContext} from '../globals/UserContext';
import axios from 'axios';
import {format} from 'timeago.js'
import {io} from "socket.io-client"
import $ from 'jquery';

function Home(props) {
    const user = useContext(userContext)
    const [conversations, setConversations] = useState([]);
    const [receiver, setReceiver] = useState(null)
    const [messages, setMessages] = useState([]);
    const [conversationId, setConversationId] = useState(null)
    const [newMessage, setNewMessage] = useState(null)
    const [arrivalMsg, setArrivalMsg] = useState(null)
    const messageEnd = useRef(null);
    const [users, setUsers] = useState([]);
    const socket = useRef();
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [onlineFriends, setOnlineFriends] = useState([]);
    const [isTyping, setIsTyping] = useState(null);


    useEffect(() => {
        if(!localStorage.getItem('accessToken')) {
            props.history.push("/login");
            return false;
        }
        socket.current = io()
        socket.current.on("getMessage", (data)=>{
            setArrivalMsg({
                _id: Math.random(),
                messageBy: data.senderId,
                message: data.message,
                conversationId: data.conversationId,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
            setIsTyping(null)
        });
    }, [props])

    useEffect(() => {
        if(localStorage.getItem('accessToken')) {
            arrivalMsg && conversationId === arrivalMsg.conversationId &&
                setMessages((prev)=>[...prev, arrivalMsg]);
        }
    }, [arrivalMsg, conversationId])


    useEffect(() => {
        if(localStorage.getItem('accessToken')) {
            if(user._id) {
                socket.current.emit("adduser", user._id);
                socket.current.on("onlineUsers", users=>{
                    setOnlineUsers(users);
                })
            }
            socket.current.on("isTyping", (data) =>{
                if(conversationId===data.conversationId && user._id === data.receiverId) {
                    setIsTyping(data.message);
                    $('.invalid-feedback').show();
                }
            });
            return function cleanup() {
                setOnlineUsers([])
            }
        }
    }, [user, conversationId])

    useEffect(() => {
        if(localStorage.getItem('accessToken')) {
            if(users && onlineUsers) {
                setOnlineFriends(users.filter(u=> onlineUsers.find((o)=> o.userId === u._id)));
            }
        }
    }, [users, onlineUsers])


    useEffect(() => {
        if(!localStorage.getItem('accessToken')) {
            return;
        }
        const config = {
            headers: {
                "x_access_token": localStorage.getItem('accessToken')
            }
        }
        axios.get("/chat/conversations", config).then(response=>{
            setConversations(response.data);
        }).catch(err=>{
            console.log(err.request.response);
        })
    }, [props]);

    useEffect(() => {
        if(!localStorage.getItem('accessToken')) {
            return;
        }
        const config = {
            headers: {
                "x_access_token": localStorage.getItem('accessToken')
            }
        }
        axios.get("/users", config).then(response=>{
            setUsers(response.data);
        }).catch(err=>{
            console.log(err.request.response);
        })        
    }, [props])

    $(document).mousemove(function(event){
        var eye = document.querySelectorAll('.eye');
        eye.forEach(eye=>{
            let x = (eye.getBoundingClientRect().left)+(eye.clientWidth/2);
            let y = (eye.getBoundingClientRect().top)+(eye.clientHeight/2);
            let radian = Math.atan2(window.event.pageX-x, window.event.pageY-y);
            let rot = (radian * (180/ Math.PI) * -1) + 0;
            eye.style.transform = "rotate("+rot+"deg)";
        })
    });

    function getMessages(convo) {
        const config = {
            headers: {
                "x_access_token": localStorage.getItem('accessToken')
            }
        }
        if(user._id!==convo.senderId._id) {
            setReceiver(convo.senderId);
        } else {
            setReceiver(convo.receiverId);
        }
        setConversationId(convo._id);
        axios.get("/chat/conversations/"+convo._id, config).then(response=>{
            setMessages(response.data);
        }).catch(err=>{
            console.log(err.request.response);
        })
        //messageEnd.current.scrollIntoView({behavior: 'smooth'})
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages])

    function scrollToBottom() {
        if(messageEnd.current) {
            messageEnd.current.scrollIntoView({behavior: 'smooth'})
        }
    }

    function submitMe(e) {
        e.preventDefault();
        document.getElementsByName("message")[0].value = '';
        const config = {
            headers: {
                "x_access_token": localStorage.getItem('accessToken')
            }
        }
        const data = {
            message: newMessage
        }

        socket.current.emit("sendMessage", {
            senderId: user._id,
            receiverId: receiver._id,
            message: newMessage,
            conversationId: conversationId,
        });

        const sendingMessage = {
            _id: Math.random(),
            messageBy: user._id,
            message: newMessage,
            conversationId: conversationId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }
        setMessages([...messages, sendingMessage]);

        axios.post('/chat/conversations/'+conversationId, data, config).then(response=>{
            // setMessages([...messages, response.data]);
        }).catch(err=>{
            alert("Oops! Your last message was not sent.")
        }) 
    }

    function newConversation(newReceiver) {
        const data = {
            receiverId: newReceiver,
        }
        const config = {
            headers: {
                "x_access_token": localStorage.getItem('accessToken')
            }
        }
        axios.post("/chat/conversation/new", data, config).then(response=>{
            getMessages(response.data);
        }).catch(err=>{
            console.log(err.request.response);
        })
    }

    function resetIt() {
        setConversationId(null);
        setReceiver(null);
    }

    function typingMessage(e) {
        setNewMessage(e.target.value);
        const textLength = e.target.value.length;
        socket.current.emit("typingMessage", {
            senderId: user._id,
            receiverId: receiver._id,
            senderName: user.name,
            conversationId: conversationId,
            textLength
        });
    }




    return (
        <div className="container-fluid">
            <div className="row py-3">
                <div className="col-md-3">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="font-weight-bold">Active Chats</h5>
                            <hr/>
                            <div className="active-chat-body">
                            {conversations.length==0 && (
                                <div className="alert alert-danger">
                                    No Active Chats.
                                </div>
                            )}
                            {conversations.map(conversation=>{
                                return(<div key={conversation._id}>
                                    <div className="active-chat row align-items-center py-2" key={conversation._id} onClick={()=> getMessages(conversation)}>
                                        <div className="active-chat-user-image col-md-3 px-2 text-right">
                                        <img src="https://clipartart.com/images/account-profile-clipart-4.png" alt="User" className="img-fluid w-50" style={{borderRadius: "50%"}} />
                                        </div>
                                        <div className="col-md-9 px-1">
                                            {conversation.senderId._id !== user._id ?
                                            (<>{conversation.senderId.name}</>)
                                            :
                                            (<>{conversation.receiverId.name}</>)
                                            }
                                        </div>
                                    </div>
                                </div>)
                            })}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card" style={{height: "85vh"}}> 
                    {receiver ?
                    (<>
                        <div className="card-header msg_head py-1">
                            <div className="d-flex bd-highlight">
                                <div className="img_cont">
                                    <img src="https://clipartart.com/images/account-profile-clipart-4.png" alt="user" className="rounded-circle user_img" />
                                    <span className="online_icon"></span>
                                </div>
                                <div className="user_info">
                                    <span>Chat with {receiver.name}</span>
                                    <p>{messages.length} Messages</p>
                                </div>
                                <div className="video_cam">
                                    <span><i className="fa fa-video-camera"></i></span>
                                    <span><i className="fa fa-phone"></i></span>
                                </div>
                                <div className="fa fa-times" onClick={resetIt} style={{position: "absolute", right: "20px", top: "15px", cursor: "pointer"}}></div>
                            </div>
                        </div>
                        <div className="card-body msg_card_body">
                        {messages.map(message=>{
                            return(<div key={message._id}>
                            {message.messageBy === user._id ?
                            (<>
                                <div className="d-flex justify-content-end mb-4 position-relative">
                                    <div className="msg_cotainer_send" title={format(message.createdAt)}>
                                        <span ref={messageEnd}>{message.message}</span>
                                        {message.createdAt ?
                                        (<span className="msg_time_send mr-5">{format(message.createdAt)}</span>)
                                        :
                                        (null)
                                        }
                                
                                    </div>
                                    <div className="img_cont_msg">
                                        <img src="https://clipartart.com/images/account-profile-clipart-4.png" alt="user" className="rounded-circle user_img_msg" />
                                    </div>
							    </div>
                            </>)
                            :
                            (<>
                                <div className="d-flex justify-content-start mb-4 position-relative">
                                    <div className="img_cont_msg">
                                        <img src="https://clipartart.com/images/account-profile-clipart-4.png" alt="user" className="rounded-circle user_img_msg" />
                                    </div>
                                    <div className="msg_cotainer" title={format(message.createdAt)}>
                                        <span ref={messageEnd}>{message.message}</span>
                                        {message.createdAt ?
                                        (<span className="msg_time mr-5">{format(message.createdAt)}</span>)
                                        :
                                        (null)
                                        }
                                    </div>
							    </div>
                            </>)
                            }
                            </div>)
                        })}

                        </div>
                        <div className="card-footer">
                            <div className="invalid-feedback text-secondary text-right position-relative" style={{right:"20px", bottom: "0.25rem"}}>{isTyping}</div>
                            <form autoComplete="off" className="input-group send-container" onSubmit={(e)=> submitMe(e)}>
                                <div className="input-group-append">
                                    <span className="input-group-text attach_btn"><i className="fa fa-paperclip"></i></span>
                                </div>
                                <input type="text" name="message" className="form-control type_msg" placeholder="Type your message..." onChange={(e)=>typingMessage(e)} required/>
                                <div className="input-group-append">
                                    <button className="input-group-text send_btn"><i className="fa fa-location-arrow"></i></button>
                                </div>
                            </form>
						</div>
                    </>)
                    :
                    (<>
                        <div className="font-weight-bold py-5 text-center">
                            <div className="head">
                                <div className="eyes">
                                    <div className="eye"></div>
                                    <div className="eye"></div>
                                </div>
                                <div className="face"></div>
                            </div>

                            <div className="pt-5">
                                <i className="fa fa-chevron-circle-left mr-1 text-success" aria-hidden="true"></i>
                                Select a user to start having conversation
                                <i className="fa fa-chevron-circle-right ml-1 text-success" aria-hidden="true"></i>
                            </div>
                        </div>
                    </>)
                    }
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="font-weight-bold">Online Users</h5>
                            <hr/>
                            <div className="contacts_body row" style={{height: "60vh"}}>
                                <ul className="contacts">
                                {onlineFriends.length==0 && (
                                <li className="alert alert-danger">
                                    Oops! No Online User Found!
                                </li>
                                )}
                                {onlineFriends.map(u=>{
                                    return(<div key={u._id}>
                                    {u._id !== user._id ?
                                    (
                                        <li className="active" onClick={() => newConversation(u._id)}>
                                            <div className="d-flex bd-highlight">
                                                <div className="img_cont">
                                                    <img src="https://clipartart.com/images/account-profile-clipart-4.png" alt="User" className="rounded-circle user_img"/>
                                                    <span className="online_icon" ></span>
                                                </div>
                                                <div className="user_info">
                                                    <span>{u.name}</span>
                                                    <p>{u.name} is online</p>
                                                </div>
                                            </div>
                                        </li>
                                    )
                                    :
                                    (null)
                                    }
                                    </div>)
                                })}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home
