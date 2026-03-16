import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import Client from '../components/Client';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
const EditorPage = () => {
    const {roomId} = useParams();
    const socketRef=useRef(null);
    const location = useLocation();
    const reactNavigator=useNavigate();
    const [clients, setClients] = useState([]);
    const codeRef=useRef(null);
    useEffect(()=>{
        const init=async () => {
            
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e){
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId, 
                username: location.state?.username
            });
            
            // Listening for joined  event 
            socketRef.current.on(ACTIONS.JOINED, ({clients, username, socketId})=>{
                //notifying all other users.
                console.log("Hi")
                if(username!==location.state?.username)
                {
                    toast.success(`${username} joined the room.`);
                    console.log(`${username} joined`);
                }
                setClients(clients);
                socketRef.current.emit(ACTIONS.SYNC_CODE, {
                    code: codeRef.current,
                    socketId,
                });
                
            });

            //Listening for disconnected
            socketRef.current.on(ACTIONS.DISCONNECTED,({socketId, username})=>{
                toast.success(`${username} left the room`);
                setClients((prev) => {
                    return prev.filter((client) => client.socketId !== socketId);
                });
            });
        };
        init();
        //cleaning listeners from useEffect cleaner
        return ()=>{
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        }
    },[]);

    async function copyRoomId(){
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success(`${roomId} Room ID has been copied to clipboard`);
        } catch (err) {
            toast.error('Could not copy the Room Id');
            console.error(err);
        }
    }

    function leaveRoom(){
        reactNavigator('/');
    }
    if(!location.state){
        return <Navigate to='/'/>
    }
    
  return (
    <div className='mainWrap'>
        <div className='aside'>
            <div className='asideInner'>
                <div className='logo'>
                    <img className='img-logo-editorpage' src='/code-it-logo.png' alt='codeItLogo'/>
                </div>
                <h3>
                    Connected
                </h3>
                <div className='clientsList'>
                    {
                        clients.map((client)=><Client key={client.socketId} username={client.username}/>)
                    }
                </div>
            </div>
            <button className='btn copyBtn' onClick={copyRoomId}>Copy Room ID</button>
            <button className='btn leaveBtn' onClick={leaveRoom}>Leave</button>
        </div>
        <div className='editorWrap'>
            <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code)=>{codeRef.current=code}}/>
        </div>
    </div>
  )
}

export default EditorPage