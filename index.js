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
const queue = {
  consultation: [],
  doctors: [],
}
// app.get('/hi', (req, res) => {
//   res.send('Hello World');
// });

io.on('connection', (socket) => {
  // console.log('clie.nt connected', socket.id);
  //2a
  socket.on('join', (payload) => {
    // socket.join will put the socket in a private room
    const doctor = { name: payload.name, id: socket.id };
    queue.doctors.push(doctor);
    socket.join(staffRoom);
    socket.to(staffRoom).emit('onlineStaff', doctor);
  });

  socket.on('createConsultation', (payload) => {
    // 2
    const consultationData={...payload, id: uuidv4(), socketId: socket.id};
    queue.consultation.push(consultationData);
    socket
      .in(staffRoom)
      .emit('newConsultation',  consultationData);
  });

  socket.on('diagnose', (payload) => {
    // when a TA claim the ticket we need to notify the student
    console.log(payload);
    console.log(queue.consultation);
    socket.to(payload.patientId).emit('diagnosed', { docName: payload.docName, diagnosis: payload.diagnosis, prescription: payload.prescription });
    queue.consultation.filter((cons) => cons.id !== payload.id);
  });
  socket.on('getAll', () => {
    queue.doctors.forEach((doc) => {
      socket.emit('onlineStaff', { docName: doc.name, id: doc.id });
    });
    queue.consultation.forEach((cons) => {
      socket.emit('newConsultation', cons);
    });
  })
  socket.on('disconnect', () => {
    socket.to(staffRoom).emit('offlineStaff', { id: socket.id });
    queue.doctors.filter((doc) => doc.id !== socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});