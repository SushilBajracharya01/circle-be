class SocketHandler {
    constructor(client, clientManager, circleManager, directMessageHandler, io) {
        this.client = client;
        this.clientManager = clientManager;
        this.chatroomManager = chatroomManager;
        this.directMessageHandler = directMessageHandler;
        this.io = io;
    }
}

export default SocketHandler;