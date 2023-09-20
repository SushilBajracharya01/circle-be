import User from "../../models/User.js";

class ClientManager {
    async addClient(client, io) {
        console.log(client, 'client.decoded.sub')
        // if (!io.sockets.adapter.rooms.get(client.decoded.sub)) {
        //     client.broadcast.emit('online_status', client.decoded.sub);
        //     await User.updateOne({ _id: client.decoded.sub }, { onlineStatus: true });
        // }
        // client.join(client.decoded.sub);
    }
}

export default ClientManager;