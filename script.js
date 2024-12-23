const socket = new WebSocket('ws://localhost:8080');

const editor = document.getElementById('editor');
const errorMessage = document.getElementById('error-message');
const usernameInput = document.getElementById('username-input');
const joinButton = document.getElementById('join-button');

joinButton.addEventListener('click', () => {
	const username = usernameInput.value;
	socket.send(JSON.stringify({ type: 'join', username }));
});

socket.onmessage = (event) => {
	try {
		const data = JSON.parse(event.data);
		if (data.type === 'document') {
			editor.innerHTML = data.content;
		} else if (data.type === 'user') {
			const user = document.createElement('div');
			user.textContent = data.username;
			editor.appendChild(user);
		} else if (data.type === 'error') {
			displayErrorMessage(data.message);
		}
	} catch (error) {
		displayErrorMessage('Error parsing message:', error);
	}
};

socket.onerror = (event) => {
	displayErrorMessage('WebSocket error:', event);
};

socket.onclose = (event) => {
	displayErrorMessage('WebSocket connection closed:', event);
};

document.addEventListener('keydown', (event) => {
	if (event.key === 'Enter') {
		try {
			const text = editor.textContent;
			socket.send(JSON.stringify({ type: 'document', content: text }));
		} catch (error) {
			displayErrorMessage('Error sending message:', error);
		}
	}
});

function displayErrorMessage(message, error) {
	errorMessage.textContent = `${message} ${error.message}`;
	console.error(message, error);
}