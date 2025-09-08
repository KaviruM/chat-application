import { useEffect, useRef, useState } from "react"

function App() {
  const socket = useRef(null)
  // register
  const [user, setUser] = useState(null)
  const [name, setName] = useState("")
  // messaging
  const [text, setText] = useState("")
  const [destination, setDestination] = useState("")
  const [list, setList] = useState([])

  const onConnect = () => {
    socket.current.send(JSON.stringify({
      type: "connect",
      name
    }))
  }

  const onSend = () => {
    socket.current.send(JSON.stringify({
      type: "message",
      text,
      destination: parseInt(destination)
    }))
    setList(prev => [
      ...prev,
      {
        text,
        source: {
          id: user.id,
          name: user.name
        },
        isOwnMessage: true
      }
    ])
    setText("")
  }

  useEffect(() => {
    if (socket.current) { return }
    socket.current = new WebSocket("ws://localhost:3001")
    socket.current.addEventListener("message", event => {
      const data = JSON.parse(event.data)
      if (data.type === "connect-done") {
        setUser({ name: data.name, id: data.id })
      } else {
        setList(prev => [...prev, { ...data, isOwnMessage: false }])
      }
    })
  }, [])

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Chat Application</h2>
        <div style={{ marginTop: '50px' }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
            style={{ padding: '10px', marginRight: '10px', fontSize: '16px' }}
            onKeyPress={e => e.key === 'Enter' && onConnect()}
          />
          <button 
            onClick={onConnect}
            style={{ 
              padding: '10px 20px', 
              fontSize: '16px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Connect
          </button>
        </div>
      </div>
    )
  } else {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h3 style={{ textAlign: 'center' }}>
          Welcome {user.name} (ID: {user.id})
        </h3>
        
        <div style={{ marginBottom: '20px' }}>
          <input
            value={destination}
            onChange={e => setDestination(e.target.value)}
            placeholder="Enter destination ID"
            style={{ padding: '8px', marginRight: '10px', width: '150px' }}
          />
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Enter message"
            style={{ padding: '8px', marginRight: '10px', flex: 1, width: '200px' }}
            onKeyPress={e => e.key === 'Enter' && onSend()}
          />
          <button 
            onClick={onSend}
            style={{ 
              padding: '8px 15px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Send
          </button>
        </div>

        <div style={{
          border: '1px solid #ccc',
          height: '400px',
          overflowY: 'scroll',
          padding: '10px',
          backgroundColor: '#f9f9f9'
        }}>
          {list.map((item, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                justifyContent: item.isOwnMessage ? 'flex-start' : 'flex-end',
                marginBottom: '10px'
              }}
            >
              <div style={{
                maxWidth: '70%',
                padding: '8px 12px',
                borderRadius: '10px',
                backgroundColor: item.isOwnMessage ? '#007bff' : '#e9ecef',
                color: item.isOwnMessage ? 'white' : 'black'
              }}>
                <div style={{ fontSize: '12px', opacity: '0.8', marginBottom: '2px' }}>
                  {item.source.name} ({item.source.id})
                </div>
                <div>{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default App