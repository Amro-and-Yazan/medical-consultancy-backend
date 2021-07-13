'use strict';

const express = require('express');
const app = express();
const http = require('http');
const PORT = process.env.PORT || 5000;
const cors = require('cors');
const server = http.createServer(app);
const io = require('socket.io')(http);
const staffRoom = 'staff';
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const router = require('./router');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/doctors';

require('dotenv').config();
app.use(cors());
app.use(express.json());

io.listen(server);
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Listening on PORT ${PORT}`);
    });
  })
  .catch((e) => {
    console.error('CONNECTION ERROR', e.message);
  });


const queue = {
  consultation: [],
  doctors: [],
}
// app.get('/hi', (req, res) => {
//   res.send('Hello World');
// });

// app.use('/admin', router);

io.on('connection', (socket) => {

  socket.on('join', (payload) => {

    const doctor = { docName: payload.docName, id: socket.id };
    
    queue.doctors.push(doctor);
    socket.join(staffRoom);
    socket.to(staffRoom).emit('onlineStaff', doctor);
  });

  socket.on('createConsultation', (payload) => {

    const consultationData={...payload, id: uuidv4(), socketId: socket.id};
    queue.consultation.push(consultationData);
    socket
      .in(staffRoom)
      .emit('newConsultation',  consultationData);
  });

  socket.on('diagnose', (payload) => {

    console.log(payload);
    // console.log(queue.consultation);
    socket.to(payload.patientId).emit('diagnosed', { docName: payload.docName, diagnosis: payload.diagnosis, prescription: payload.prescription });
    queue.consultation=queue.consultation.filter((cons) => cons.id !== payload.id);
    socket.to(staffRoom).emit('closed', payload.id);
  });
  socket.on('getAll', () => {
    queue.doctors.forEach((doc) => {
      socket.emit('onlineStaff', { docName: doc.docName, id: doc.id });
    });
    queue.consultation.forEach((cons) => {
      socket.emit('newConsultation', cons);
    });
  })
  socket.on('disconnect', () => {
    socket.to(staffRoom).emit('offlineStaff', { id: socket.id });
    queue.doctors=queue.doctors.filter((doc) => doc.id !== socket.id);
  });
});

