const socket = io();
let currentRoomCode;

document.getElementById('createRoomBtn').addEventListener('click', () => {
    const roomCode = prompt('Enter a 6 digit room code:');
    if (roomCode && roomCode.length === 6) {
        currentRoomCode = roomCode;
        socket.emit('createRoom', roomCode);
    } else {
        alert('Please enter a valid 6 digit room code.');
    }
});

document.getElementById('joinRoomBtn').addEventListener('click', () => {
    const roomCode = prompt('Enter a 6 digit room code to join:');
    if (roomCode && roomCode.length === 6) {
        currentRoomCode = roomCode;
        socket.emit('joinRoom', roomCode);
    } else {
        alert('Please enter a valid 6 digit room code.');
    }
});

socket.on('roomCreated', (roomCode) => {
    alert(`Room created with code: ${roomCode}`);
    showGame();
});

socket.on('roomJoined', (roomCode) => {
    alert(`Joined room: ${roomCode}`);
    showGame();
});

socket.on('startGame', (players) => {
    document.getElementById('user1').innerText = players[0];
    document.getElementById('user2').innerText = players[1];
});

document.getElementById('spinBtn').addEventListener('click', () => {
    socket.emit('spinBottle', currentRoomCode);
});

socket.on('bottleSpun', (userId) => {
    const bottle = document.getElementById('bottle');
    bottle.style.transform = `rotate(${Math.random() * 720 + 360}deg)`;
    setTimeout(() => {
        if (socket.id === userId) {
            openModal(`
                <button id="truthBtn">Truth</button>
                <button id="dareBtn">Dare</button>
            `);
            document.getElementById('truthBtn').addEventListener('click', () => {
                socket.emit('truthOrDare', { type: 'truth', roomCode: currentRoomCode });
                closeModal();
            });
            document.getElementById('dareBtn').addEventListener('click', () => {
                socket.emit('truthOrDare', { type: 'dare', roomCode: currentRoomCode });
                closeModal();
            });
        }
    }, 2000);
});

socket.on('truthOrDare', (data) => {
    if (data.type === 'truth') {
        openModal(`
            <input type="text" id="questionInput" placeholder="Ask a truth question (only non spin user)">
            <button id="sendQuestionBtn">Send</button>
        `);
        document.getElementById('sendQuestionBtn').addEventListener('click', () => {
            const question = document.getElementById('questionInput').value;
            socket.emit('submitQuestion', { question: question, roomCode: data.roomCode });
            closeModal();
        });
    } else if (data.type === 'dare') {
        openModal(`
            <input type="text" id="questionInput" placeholder="Give a dare (only non spin user)">
            <button id="sendQuestionBtn">Send</button>
        `);
        document.getElementById('sendQuestionBtn').addEventListener('click', () => {
            const dare = document.getElementById('questionInput').value;
            socket.emit('submitQuestion', { question: dare, roomCode: data.roomCode });
            closeModal();
        });
    }
});

socket.on('receiveQuestion', (data) => {
    openModal(`
        <p>${data.question}</p>
        <input type="text" id="answerInput" placeholder="Your answer">
        <button id="sendAnswerBtn">Send</button>
    `);
    document.getElementById('sendAnswerBtn').addEventListener('click', () => {
        const answer = document.getElementById('answerInput').value;
        socket.emit('submitAnswer', { answer: answer, roomCode: data.roomCode });
        closeModal();
    });
});

socket.on('receiveAnswer', (data) => {
    openModal(`
        <p>Answer: ${data.answer}</p>
        <button id="closeModalBtn">Close</button>
    `);
    document.getElementById('closeModalBtn').addEventListener('click', () => {
        closeModal();
    });
});

function showGame() {
    document.getElementById('main').style.display = 'none';
    document.getElementById('game').style.display = 'block';
}

function openModal(content) {
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}
