import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import Client from '../components/Client';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
import DropButton from '../components/DropButton';
import CustomButton from '../components/CustomButton';
import { CaretRightFilled } from '@ant-design/icons';
const EditorPage = () => {
    const {roomId} = useParams();
    const socketRef=useRef(null);
    const location = useLocation();
    const reactNavigator=useNavigate();
    const [clients, setClients] = useState([]);
    const codeRef=useRef(null);
    const [selectedLang, setSelectedLang] = useState({name: "C++", language: "cpp"});
    const [input, setInput] = useState("");
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

    const runCode = async () => {
        try {
            const code = codeRef.current;

            const response = await fetch("/run", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                code,
                language: selectedLang.language,
                input,
            }),
            });

            const data = await response.json();

            console.log(data);

        } catch (err) {
            console.error(err);
        }
    };
    const handleRunClick=  ()=>{
        runCode();
    }
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
            <div className="editorToolbar">
                <DropButton items={[
                                    { name: "JavaScript", language: "nodejs" },  
                                    { name: "Python", language: "python3" },   
                                    { name: "Java", language: "java" },          
                                    { name: "C++", language: "cpp17" },   
                                ]} 
                buttonName={selectedLang?.name || "Select Language"}
                setSelectedLang={setSelectedLang}
                overlayStyle={{ zIndex: 9999 }}/>

                <CustomButton
                    label={
                        <>
                        <CaretRightFilled style={{ color: "#4aed88", marginRight: "6px" }} />
                        Run
                        </>
                    }
                    onClick={handleRunClick}
                />
            </div>
            <div className="editorMain">
                <div className="editorLeft">
                    <Editor
                    socketRef={socketRef}
                    roomId={roomId}
                    onCodeChange={(code) => { codeRef.current = code }}
                    />
                </div>

                <div className="editorRight">
                    <textarea 
                        className="inputBoxArea" 
                        placeholder="Input..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)} 
                    />
                    <textarea className="outputBoxArea" placeholder="Output..." />
                </div>
            </div>
        </div>
    </div>
  )
}

export default EditorPage