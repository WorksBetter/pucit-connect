import React, { Component } from 'react';
import {FaAngleDown} from "react-icons/fa";
import {FaRocketchat} from "react-icons/fa";
import {FaSistrix} from "react-icons/fa";
import {FaAngleUp} from "react-icons/fa";
import {SideBarOption} from "./SideBarOption";
import { last, get, differenceBy } from 'lodash' 
import { createChatNameFromUsers } from '../../Factories'

export default class SideBar extends Component{
	static type = {
		USERS:"users",
		CHATS:"chats"
    }

	constructor(props){
        super();
        this.userRef = React.createRef();
		this.state = {
			receiver:"",
			activeSideBar: SideBar.type.CHATS
		}
	}
	handleSubmit = (e) => {
		e.preventDefault()
		const { receiver } = this.state
		const { onSendPrivateMessage } = this.props

		onSendPrivateMessage(receiver)
		this.setState({receiver:""})
	}

	addChatForUser = (receiver) => {
		this.props.onSendPrivateMessage(receiver)
		this.setActiveSideBar(SideBar.type.CHATS)
	}
	setActiveSideBar = (type) => {
		this.setState({ activeSideBar:type })
	}

	render(){
		const { chats, userActiveChat, user, userSetActiveChat, logout, users } = this.props
		const { receiver, activeSideBar } = this.state
		return (
			<div id="side-bar">
					<div className="heading">
						<div className="app-name">Our Cool Chat <FaAngleDown /></div>
						<div className="menu">
							<FaRocketchat />
						</div>
					</div>
					<form onSubmit={this.handleSubmit} className="search">
						<i className="search-icon"><FaSistrix /></i>
						<input 
							placeholder="Search" 
							type="text"
							value={receiver}
							onChange={(e)=>{ this.setState({receiver:e.target.value}) }}/>
						<div className="plus"></div>
					</form>
					<div className="side-bar-select">
						<div 
							onClick = { ()=>{ this.setActiveSideBar(SideBar.type.CHATS) } }
							className={`side-bar-select__option ${ activeSideBar === SideBar.type.CHATS ? 'active':''}`}>
							<span>Chats</span>
						</div>
						<div 
							onClick = { ()=>{ this.setActiveSideBar(SideBar.type.USERS) } }
							className={`side-bar-select__option ${ activeSideBar === SideBar.type.USERS ? 'active':''}`}>
							<span>Users</span>
						</div>
					</div>
					<div 
						className="users" 
						ref={this.userRef} 
						onClick={(e)=>{ (e.target === this.userRef.current.user) && userSetActiveChat(null) }}>		
						{
						activeSideBar === SideBar.type.CHATS ?
						chats.map((chat)=>{
								return(
								<SideBarOption 
									key = {chat.id}
									lastMessage = { get(last(chat.messages), 'message', '') }
									name = { chat.isCommunity ? chat.name : createChatNameFromUsers(chat.users, user.name) }
									active = { userActiveChat.id === chat.id }
									onClick = { ()=>{ this.props.userSetActiveChat(chat) } }
								/>
							)
						})	
						:
							differenceBy(users, [user], 'name').map((user)=>{
								return <SideBarOption 
									key = { user.id }
									name = { user.name }
									onClick = { ()=>{ this.addChatForUser(user.name) }  }
								/>
							})
						}
					</div>
					<div className="current-user">
						<span>{user.name}</span>
						<div onClick={()=>{logout()}} title="Logout" className="logout">
							<FaAngleUp/>	
						</div>
					</div>
			</div>
		);
	
	}
}