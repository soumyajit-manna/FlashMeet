import { Server } from "socket.io";


// Object to store connections, messages, and the time each has been online
let connections = {}
let messages = {}
let timeOnline = {}


// Function to set up the Socket.IO server
export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*", // Allow requests from any origin
            methods: ["GET", "POST"], // Allow GET and POST methods
            allowedHeaders: ["*"], // Allow any headers
            credentials: true // Allow credentials (cookies, authorization headers, etc.)
        }
    });
    
    // Listening for connections to the socket
    io.on("connection", (socket) => {

        console.log("SOMETHING CONNECTED");
        
        // Event listener for when a user joins a call 
        socket.on("join-call", (path) => {
            
            // If no connections exist for this path, create an empty array
            if(connections[path] === undefined) {
                connections[path] = []
            }

            // Add the socket ID to the connections array for this path
            connections[path].push(socket.id)

            // Record the time the user joined
            timeOnline[socket.id] = new Date();
            
            // Notify all users in the same call that a new user has joined
            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
            }

            // If there are existing messages in the chat, send them to the new user
            if (messages[path] !== undefined) {
                for ( let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", 
                        messages[path][a]['data'],
                        messages[path][a]['sender'], 
                        messages[path][a]['socket-id-sender']
                    )
                }
            }


        })
        
        // Event listener for signaling (WebRTC signaling for peer-to-peer connections)
        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })
        
        // Event listener for chat messages
        socket.on("chat-message", (data, sender) => {

             // Find the room (path) that the socket ID belongs to
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {

                    if(!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];  // Return the matching room and set found to true
                    }

                    return [room, isFound];

                }, ['', false]);
            
            if (found === true) { // If a matching room was found
                // If there are no messages for this room, create an empty array
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }

                // Store the new message with sender details
                messages[matchingRoom].push({ 
                    'sender': sender, 
                    "data": data, 
                    "socket-id-sender": socket.id 
                })
                console.log("message", matchingRoom, ":", sender, data)

                // Store the new message with sender details
                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }    
        })
        
        // Event listener for when a user disconnects
        socket.on("disconnect", () => {

            // Calculate how long the user was online
            var diffTime = Math.abs(timeOnline[socket.id] - new Date())

            var key
            
            // Iterate over all connections to find the room the user was in
            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {

                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) { // If the socket ID is found in the room
                        key = k
                        
                        // Notify other users in the room that the user has left
                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }

                        // Remove the user's socket ID from the room
                        var index = connections[key].indexOf(socket.id)

                        connections[key]. splice(index, 1)

                        // If the room is now empty, delete it
                        if (connections[key].length === 0) {
                            delete connections[key]
                        }
                    }
                }
            }

        })
    })

    return io; // Return the Socket.IO instance
}

