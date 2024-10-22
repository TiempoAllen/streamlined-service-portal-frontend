import React from "react";
import profilePic from "../../assets/profile.jpg";
import classes from "./Chat.module.css";
import attachmentImage from "../../assets/attachment.svg";
import sendImage from "../../assets/send.svg";

const Chat = () =>{
    return(
        <section className={classes.main}>
            <div className={classes.chatPeopleContainer}>
                <div className={classes.chatColumn}>
                <div className={classes.chatContainer}>
                <img src={profilePic} className={classes.profilePic}/>
                    <div className={classes.parentColumn}>
                            <span className={classes.username}>John Doe</span>
                        <div className={classes.childRow}>
                            <span className={classes.lastMessage}>heyheyheyhetetwehw</span>
                            <span className={classes.duration}>4 m</span>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
            
            <div className={classes.chatMessages}>
                <div className={classes.messages}>
                    <div className={classes.sender}>
                        <div className={classes.messageContent}>
                            <p>hello!dsadasdasddsadsad</p>
                        </div>
                    </div>
                    <div className={classes.receiver}>
                        <div className={classes.messageContent}>
                            <p>Hiadasdsadasdasdasdsadasdasdsadsadsadsadasdsaassdasdasdasd!</p>
                        </div>
                    </div>
                </div>

                <div className={classes.inputContainer}>
                        <img src={attachmentImage} className={classes.attachmentImage}/>
                        <input type="text" placeholder="Write a message..." className={classes.messageInput} />
                        <img src={sendImage} className={classes.sendImage}/>
                </div>  
            </div>
        </section>
    );
};

export default Chat;