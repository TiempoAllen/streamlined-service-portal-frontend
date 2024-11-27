import { Client } from '@stomp/stompjs';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { json, redirect, useRouteLoaderData } from "react-router-dom";
import SockJS from 'sockjs-client';
import attachmentImage from '../../assets/attachment.svg';
import profilePic from '../../assets/profile.svg';
import sendImage from '../../assets/send.svg';
import classes from './Chat.module.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const Chat = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);
    const [client, setClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [lastMessages, setLastMessages] = useState({});
    const [activeUserId, setActiveUserId] = useState(null); 
    const [currentSubscription, setCurrentSubscription] = useState(null);



    const userId = useRouteLoaderData("chat");

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    };
    



    const getChannelName = (userId1, userId2) => {
        return userId1 < userId2 ? `${userId1}-${userId2}` : `${userId2}-${userId1}`;
    };

    const handleSendEnter = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!e.repeat) { 
                handleSendMessage();
            }
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${API_URL}/user/all`);
                setUsers(response.data);
                setFilteredUsers(response.data);
                fetchLastMessages(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);


    const fetchLastMessages = async (users) => {
        for (const user of users) {
            const channelName = getChannelName(userId.user_id, user.user_id);
            try {
                const response = await axios.post(`${API_URL}/chat/getMessages`, channelName, {
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                });
                const lastMessage = response.data.length ? response.data[response.data.length - 1] : null; // Get last message if available
                setLastMessages(prev => ({
                    ...prev,
                    [user.user_id]: lastMessage
                }));
            } catch (error) {
                console.error(`Error fetching messages for user ${user.user_id}:`, error);
            }
        }
    };

    useEffect(() => {
        const socket = new SockJS(`${API_URL}/chat`);
        const stompClient = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {},
            debug: function (str) {
                console.log(str);
            },
            onConnect: () => {
                console.log('WebSocket connected');
                setIsConnected(true);
            },
            onDisconnect: () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);
            },
        });
    
        stompClient.activate();
        setClient(stompClient);
    
        return () => {
            if (stompClient) {
                stompClient.deactivate();
            }
        };
    }, [userId]);
    
    

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredUsers(users.filter(user =>
            (user.firstname + ' ' + user.lastname).toLowerCase().includes(query)
        ));
    };


    const handleUserClick = async (user) => {
        if (selectedUser && selectedUser.user_id === user.user_id) {
            console.log("User is already selected, ignoring click.");
            return; // Exit early if the user is already selected
        }
    
        if (currentSubscription) {
            console.log(`Unsubscribing from current channel: ${currentSubscription.id}`);
            currentSubscription.unsubscribe();
            setCurrentSubscription(null);
        }
    
        setSelectedUser(user);
        setActiveUserId(user.user_id);
        const channelName = getChannelName(userId.user_id, user.user_id);
        scrollToBottom();


        if(!channelName){
            
        }
    
        try {
            const response = await axios.post(`${API_URL}/chat/getMessages`, channelName, {
                headers: {
                    'Content-Type': 'text/plain',
                },
            });
    
            // Mark messages as READ
            await markMessagesAsRead(response.data.map(msg => msg.messageId)); // Assuming `messageId` identifies messages
            
            setMessages(response.data);
            scrollToBottom();
    
            if (client && isConnected) {
                console.log(`Subscribing to channel: ${channelName}`);
    
                const subscription = client.subscribe(`/topic/messages/${channelName}`, (message) => {
                    if (message.body) {
                        const newMessage = JSON.parse(message.body);
                        console.log('Received message:', newMessage);
                        setMessages((prevMessages) => [...prevMessages, newMessage]);
    
                        // Update last message state
                        setLastMessages(prev => ({
                            ...prev,
                            [user.user_id]: newMessage
                        }));
                    }
                });
    
                // Save the current subscription so we can unsubscribe later
                setCurrentSubscription(subscription);
    
            } else {
                console.warn('Client not connected. Cannot subscribe.');
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };
    


    
    
    const handleSendMessage = async () => {
        if (!messageInput.trim() && !selectedFile) return; // Ensure there's input or a file
    
        if (!client || !isConnected) {
            console.error("WebSocket connection is not established. Cannot send message.");
            return;
        }
    
        const channelName = getChannelName(userId.user_id, selectedUser.user_id);
        const now = new Date();
        const timestamp = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')} - ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
        try {
            // Publish the message (text and/or file)
            const messageBody = {
                sender: userId.user_id,
                receiver: selectedUser.user_id,
                content: messageInput, // This will now include the file name
                status: 'SENT',
                timestamp: timestamp,
                attachment: selectedFile ? URL.createObjectURL(selectedFile) : null, // Create a URL for the file
            };
    
            client.publish({
                destination: `/app/chat/${channelName}`,
                body: JSON.stringify(messageBody),
            });
    
            // Update last message state immediately after sending
            setLastMessages(prev => ({
                ...prev,
                [selectedUser.user_id]: messageBody
            }));
    
            setMessageInput(''); // Clear the message input
            setSelectedFile(null); // Clear the selected file
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };
    

    const markMessagesAsRead = async (messageIds) => {
        try {
            await axios.put(`${API_URL}/messages/markAsRead`, messageIds);
            console.log("Messages marked as read:", messageIds);
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };
    

    const calculateDuration = (timestamp) => {
        if (!timestamp) {
            console.warn("No timestamp provided");
            return "No duration available";
        }
    

        const [datePart, timePart] = timestamp.split(' - ');
    
 
        if (!datePart || !timePart) {
            console.error("Invalid timestamp format:", timestamp);
            return "Invalid timestamp";
        }
    
        const [year, month, day] = datePart.split('/').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
    
    
        if ([year, month, day, hour, minute].some(part => isNaN(part))) {
            console.error("Invalid date or time component:", { year, month, day, hour, minute });
            return "Invalid date";
        }
    

        const messageDate = new Date(year, month - 1, day, hour, minute);
        const now = new Date();

    
        const diffMs = now - messageDate;
    
   
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
    

        if (diffDays > 0) {
            return `${diffDays}d${diffDays > 1 ? '' : ''} ago`;
        } else if (diffHours > 0) {
            return `${diffHours}h${diffHours > 1 ? '' : ''} ago`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes}m${diffMinutes > 1 ? '' : ''} ago`;
        } else {
            return "Just now";
        }
    };
    


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setMessageInput(file.name); // Set the input to the file name
            console.log("Selected file:", file);
        }
    };
    
    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        
        <section className={classes.main}>
            <div className={classes.chatPeopleContainer}>
                <div className={classes.chatColumn}>
                    <input
                        type="text"
                        placeholder="Search..."
                        className={classes.searchBar}
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    {Array.isArray(filteredUsers) && filteredUsers.map(user => (
                        <div
                            key={user.user_id}
                            className={`${classes.chatContainer} ${activeUserId === user.user_id ? classes.activeUser : ''}`}
                            onClick={() => handleUserClick(user)}
                        >
                            <img src={profilePic} className={classes.profilePic} alt="Profile" />
                            <div className={classes.parentColumn}>
                                <span className={classes.username}>
                                    {user.firstname} {user.lastname}
                                </span>
                                <div className={classes.childRow}>
                                     <span className={classes.lastMessage}>
                                     {lastMessages[user.user_id] ? (
                                            lastMessages[user.user_id].attachment ? (
                                                lastMessages[user.user_id].sender === userId.user_id.toString()
                                                    ? `You sent an attachment` // If the current user sent the attachment
                                                    : `${user.firstname} sent an attachment` // If the other user sent the attachment
                                            ) : (
                                                lastMessages[user.user_id].sender === userId.user_id.toString()
                                                    ? `You: ${lastMessages[user.user_id].content}` // If the current user sent a text message
                                                    : `${user.firstname}: ${lastMessages[user.user_id].content}` // If the other user sent a text message
                                            )
                                        ) : (
                                            "No messages yet"
                                        )}
                                    </span>
                                    <span className={classes.duration}>
                                        {lastMessages[user.user_id]
                                            ? calculateDuration(lastMessages[user.user_id].timestamp) 
                                            : ""}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
                    
            <div className={classes.chatMessages}>
                <div className={classes.messages}>
                {Array.isArray(messages) && messages.map((msg, index) => (
                    <div
                        key={index}
                        className={msg.sender === userId.user_id.toString() ? classes.sender : classes.receiver}
                    >
                        <div className={classes.messageContent}>
                            <p>{msg.content}</p>
                            {msg.attachment && (
                                <a href={msg.attachment} target="_blank" rel="noopener noreferrer">View Attachment</a>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                ))}
                </div>

                <div className={classes.inputContainer}>
                    <img 
                        src={attachmentImage} 
                        className={classes.attachmentImage} 
                        alt="Attachment"
                        onClick={() => document.getElementById('fileInput').click()} 
                    />
                    <input 
                        type="file" 
                        id="fileInput" 
                        style={{ display: 'none' }} 
                        onChange={handleFileChange}
                    />
                    <input
                        type="text"
                        placeholder="Write a message..."
                        className={classes.messageInput}
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value)}
                        onKeyDown={handleSendEnter}
                    />
                    <img
                        src={sendImage}
                        className={classes.sendImage}
                        alt="Send"
                        onClick={handleSendMessage}
                    />
                </div>
            </div>
        </section>

        
    );

};

export default Chat;


export async function loader({ params }) {
    const user_id = params.user_id; 
    const token = localStorage.getItem("token");
  
    if (!token) {
      return redirect("/");
    }
  
    try {
      const response = await axios.get(`${API_URL}/user/${user_id}`, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
  
      const user = response.data;
      if (!user) {
        throw json({ message: "User not found" }, { status: 500 });
      }
  
      return user; 
    } catch (error) {
      throw new Error(`Error fetching user details: ${error.message}`);
    }
  }