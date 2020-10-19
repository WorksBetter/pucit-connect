import React from "react";

function ChatHeading({name, numberOfUsers}){

    return (
        <div className="chat-header">
            <div className="user-info">
                <div className="username">{name}</div>
                <div className="status">
                    <div className="indicator"></div>
                    <span>{numberOfUsers ? numberOfUsers : null}</span>
                </div>
            </div>
            <div className="options">
                {/* <FAVideo />
                <FAUserPlus />
                <MdEllipsisMenu /> */}
            </div>
        </div>
    )
}

export default ChatHeading;