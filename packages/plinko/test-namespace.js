import io from 'socket.io-client';

console.log('🧪 Testing Socket.IO namespace connection...\n');

const socket = io('http://localhost:5000', {
    transports: ['websocket'],
    query: {
        session: 'test-session',
        ss: 'test-session',
        currency: 'USD',
        username: 'test_player',
        browserUserAgent: 'TestClient'
    },
    timeout: 5000
});

socket.on('connect', () => {
    console.log('✅ Connected to /user/plinko namespace!');
    socket.emit('sign-in');
});

socket.on('signed-in', () => {
    console.log('✅ Signed in successfully!');
    socket.emit('in-game');
});

socket.on('game-event', (data) => {
    if (data.gameConfigs) {
        console.log('✅ Received game configs!');
        console.log('🎯 Namespace test successful!');
        socket.disconnect();
        process.exit(0);
    }
});

socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
    socket.disconnect();
    process.exit(1);
});

socket.on('connect_timeout', () => {
    console.error('❌ Connection timeout');
    socket.disconnect();
    process.exit(1);
});

setTimeout(() => {
    console.error('❌ Test timeout - no connection established');
    socket.disconnect();
    process.exit(1);
}, 10000);
