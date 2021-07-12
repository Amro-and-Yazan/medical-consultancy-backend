const express = require('express');
const app = express();
const http = require('http');
const PORT = process.env.PORT || 5000;
const cors = require('cors');
const server = http.createServer(app);
const io = require('socket.io')(http);
const staffRoom = 'staff';
const { v4: uuidv4 } = require('uuid');

io.listen(server);

app.use(cors());

// app.get('/hi', (req, res) => {
//   res.send('Hello World');
// });

io.on('connection', (socket) => {
  // console.log('clie.nt connected', socket.id);
  //2a
  socket.on('join', (payload) => {
    // socket.join will put the socket in a private room
    socket.join(staffRoom);
    socket.to(staffRoom).emit('onlineStaff', { name: payload.name, id: socket.id });
  });
  socket.on('createConsultation', (payload) => {
    // 2
    socket
      .in(staffRoom)
      .emit('newConsultation', { ...payload, id: uuidv4(), socketId: socket.id });
  });

  socket.on('diagnose', (payload) => {
    // when a TA claim the ticket we need to notify the student
    socket.to(payload.patientId).emit('diagnosed', { docName: payload.docName, diagnosis:payload.diagnosis, prescription:payload.prescription});
  });
  socket.on('disconnect', () => {
    socket.to(staffRoom).emit('offlineStaff', { id: socket.id });
  });
});

server.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});