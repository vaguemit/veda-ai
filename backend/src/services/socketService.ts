import { Server } from 'socket.io';
import http from 'http';

let io: Server | null = null;

export function initSocket(server: http.Server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Join room for a specific assignment ID to receive its real-time updates
    socket.on('join:assignment', (assignmentId: string) => {
      socket.join(assignmentId);
      console.log(`Socket ${socket.id} joined room: ${assignmentId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function emitToAssignmentRoom(assignmentId: string, eventName: string, data: any) {
  if (io) {
    io.to(assignmentId).emit(eventName, data);
    // Also emit globally for general dashboard list updating
    io.emit('assignments:updated', { id: assignmentId, ...data });
  }
}
