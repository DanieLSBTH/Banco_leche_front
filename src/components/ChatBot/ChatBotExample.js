import React, { useState, useRef, useEffect } from 'react';
import '../Css/ChatBotExample.css';
import agentIcon from '../Images/backgrounds/agent-icon.png';
import userIcon from '../Images/backgrounds/user-icon.png';
import sendIcon from '../Images/backgrounds/send-icon.png';
import closeIcon from '../Images/backgrounds/close-icon.png';
import ReactPlayer from 'react-player/youtube';

const ChatBotExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: '¡Hola! Soy PediBot. ¿Cómo te llamas?', isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('');
  const [greetingSent, setGreetingSent] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [temaSeleccionado, setTemaSeleccionado] = useState(null);
  const [subtemaSeleccionado, setSubtemaSeleccionado] = useState(null);
  const [preguntaSeleccionada, setPreguntaSeleccionada] = useState(null);
  const messageContainerRef = useRef(null);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim()) {
      const newMessages = [
        ...messages,
        { text: input, isBot: false }
      ];
      setMessages(newMessages);
      setInput('');

      if (!userName) {
        setUserName(input);
        setGreetingSent(true);

        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prevMessages => [
            ...prevMessages,
            { text: `Mucho gusto, ${input}. ¿Analizo que esta aqui para informarte?`, isBot: true }
          ]);
        }, 1000);
      
        setTimeout(async () => {
          try {
            const response = await fetch('https://banco-leche-backend.onrender.com/api/chat_temas/');
            const temas = await response.json();

            mostrarTemasUnoPorUno(temas, userName);
          } catch (error) {
            setIsTyping(false);
            setMessages(prevMessages => [
              ...prevMessages,
              { text: 'Lo siento, hubo un problema al consultar los temas.', isBot: true }
            ]);
          }
        }, 1000);
      } else if (temaSeleccionado && !subtemaSeleccionado) {
        const temaId = parseInt(input);
        if (!isNaN(temaId)) {
          obtenerSubtemas(temaId);
        } else {
          setMessages(prevMessages => [
            ...prevMessages,
            { text: 'Por favor ingresa un número de tema válido.', isBot: true }
          ]);
        }
      } else if (subtemaSeleccionado && !preguntaSeleccionada) {
        const subtemaId = parseInt(input);
        if (!isNaN(subtemaId)) {
          obtenerPreguntas(subtemaId);
        } else {
          setMessages(prevMessages => [
            ...prevMessages,
            { text: 'Por favor ingresa un número de subtema válido.', isBot: true }
          ]);
        }
      } else if (preguntaSeleccionada) {
        const idChat = parseInt(input);
        if (!isNaN(idChat)) {
          obtenerRespuestas(idChat);
        } else {
          setMessages(prevMessages => [
            ...prevMessages,
            { text: 'Por favor ingresa un número de pregunta válido.', isBot: true }
          ]);
        }
      } else {
        const botResponseDelay = Math.random() * 3000 + 1000;
        setIsTyping(true);

        setTimeout(() => {
          setIsTyping(false);
          setMessages(prevMessages => [
            ...prevMessages,
            { text: 'Estoy aquí para ayudarte con cualquier pregunta que tengas.', isBot: true }
          ]);
        }, botResponseDelay);
      }
    }
  };

  const mostrarTemasUnoPorUno = (temas, nombreUsuario) => {
    let delay = 0;
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prevMessages => [
        ...prevMessages,
        { text: `Con gusto, ${nombreUsuario}. Puedo ayudarte informándote sobre estos temas:`, isBot: true }
      ]);

      temas.forEach((tema, index) => {
        const temaId = tema.id_tema || index + 1;
        const temaTexto = tema.tema || 'Tema sin nombre';

        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setMessages(prevMessages => [
              ...prevMessages,
              { text: `Tema ${temaId}: ${temaTexto}`, isBot: true }
            ]);
            setTemaSeleccionado(true);
          }, 1000);
        }, delay);

        delay += 2000;
      });

      setTimeout(() => {
        setIsTyping(false);
        setMessages(prevMessages => [
          ...prevMessages,
          { text: 'Por favor ingresa el número del tema que te interesa.', isBot: true }
        ]);
      }, delay + 1000);
    }, 1000);
  };

  const obtenerSubtemas = async (id_tema) => {
    setIsTyping(true);
    setMessages(prevMessages => [
      ...prevMessages,
      { text: 'Puedo ayudarte informándote sobre estos subtemas:', isBot: true }
    ]);

    try {
      const response = await fetch(`https://banco-leche-backend.onrender.com/api/chat_subtemas/tema/${id_tema}`);
      const subtemas = await response.json();

      if (subtemas.length > 0) {
        subtemas.forEach((subtema) => {
          setMessages(prevMessages => [
            ...prevMessages,
            { text: `Subtema ${subtema.id_subtema}: ${subtema.nombre}`, isBot: true }
          ]);
        });
        setSubtemaSeleccionado(true);
      } else {
        setMessages(prevMessages => [
          ...prevMessages,
          { text: 'No se encontraron subtemas para este tema.', isBot: true }
        ]);
      }
    } catch (error) {
      setMessages(prevMessages => [
        ...prevMessages,
        { text: 'Lo siento, hubo un problema al consultar los subtemas.', isBot: true }
      ]);
    }
    setIsTyping(false);
  };

  const obtenerPreguntas = async (id_subtema) => {
    setIsTyping(true);
    setMessages(prevMessages => [
      ...prevMessages,
      { text: 'Aquí tienes algunas preguntas frecuentes relacionadas con este subtema:', isBot: true }
    ]);

    try {
      const response = await fetch(`https://banco-leche-backend.onrender.com/api/chat_respuestas/subtema/${id_subtema}`);
      const preguntas = await response.json();

      if (preguntas.length > 0) {
        preguntas.forEach((pregunta) => {
          setMessages(prevMessages => [
            ...prevMessages,
            { text: `Pregunta ${pregunta.id_chat}: ${pregunta.pregunta}`, isBot: true }
          ]);
        });
        setPreguntaSeleccionada(true);
      } else {
        setMessages(prevMessages => [
          ...prevMessages,
          { text: 'No se encontraron preguntas para este subtema.', isBot: true }
        ]);
      }
    } catch (error) {
      setMessages(prevMessages => [
        ...prevMessages,
        { text: 'Lo siento, hubo un problema al consultar las preguntas.', isBot: true }
      ]);
    }
    setIsTyping(false);
  };

  const obtenerRespuestas = async (id_chat) => {
    setIsTyping(true);
    setMessages(prevMessages => [
      ...prevMessages,
      { text: 'Aquí tienes la respuesta a tu pregunta:', isBot: true }
    ]);

    try {
      const response = await fetch(`https://banco-leche-backend.onrender.com/api/chat_respuestas/chat/${id_chat}`);
      const respuesta = await response.json();

      if (respuesta && Array.isArray(respuesta) && respuesta.length > 0) {
        const responseMessage = respuesta[0].respuesta;
        const enlace = respuesta[0].enlace;

        setMessages(prevMessages => [
          ...prevMessages,
          { text: responseMessage, enlace, isBot: true }
        ]);
      } else {
        setMessages(prevMessages => [
          ...prevMessages,
          { text: 'Lo siento, no encontré una respuesta a tu pregunta.', isBot: true }
        ]);
      }
    } catch (error) {
      setMessages(prevMessages => [
        ...prevMessages,
        { text: 'Lo siento, hubo un problema al consultar la respuesta.', isBot: true }
      ]);
    }
    setIsTyping(false);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 3000);
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-icon" onClick={() => setIsOpen(!isOpen)}>
        💬
      </button>
      {isOpen && (
        <div className={`chatbox ${isClosing ? 'chatbox-closing chatbox-hidden' : ''}`}>
          <div className="chatbox-header">
            <span>Chatbot</span>
            <img
              src={closeIcon}
              alt="Close"
              className="close-icon"
              onClick={handleClose}
            />
          </div>
          <div className="message-container" ref={messageContainerRef} aria-live="polite">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.isBot ? 'bot' : 'user'}`}>
                {message.isBot ? (
                  <>
                    <img src={agentIcon} alt="Agent" className="message-icon" />
                    <div className="message-bubble bot-bubble">
                      {message.text}
                      {message.enlace && (
                        <>
                          <a href={message.enlace} target="_blank" rel="noopener noreferrer">
                            {message.enlace}
                          </a>
                          {message.enlace.includes('youtube.com') && (
                            <div className="video-container">
                              <ReactPlayer 
                                url={message.enlace} 
                                controls={true} 
                                width="100%" 
                                height="200px"
                                light={true} // Muestra la vista previa (thumbnail)
                                playIcon={
                                  <button style={{
                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '64px',
                                    height: '64px',
                                    cursor: 'pointer'
                                  }}>
                                    ▶
                                  </button>
                                }
                                config={{
                                  youtube: {
                                    playerVars: { origin: window.location.origin }
                                  }
                                }}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="message-bubble user-bubble">{message.text}</div>
                    <img src={userIcon} alt="User" className="message-icon" />
                  </>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            )}
          </div>
          <div className="input-container">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Escriba el mensaje..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <img
              src={sendIcon}
              alt="Send"
              className="send-icon"
              onClick={handleSend}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBotExample;
