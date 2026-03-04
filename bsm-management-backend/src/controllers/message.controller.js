import {
  getMessagesService,
  sendMessageService,
  getOwnerRoomsService
} from "../services/message.service.js";

export async function getOwnerRooms(req, res) {

  try {

    const ownerId = req.user.id;

    const rooms = await getOwnerRoomsService(ownerId);

    res.json(rooms);

  } catch (err) {

    res.status(500).json({ message: err.message });

  }

}

export async function getMessages(req, res) {

  try {

    const roomId = Number(req.params.roomId);

    const messages = await getMessagesService(roomId);

    res.json(messages);

  } catch (err) {

    res.status(400).json({ message: err.message });

  }

}

export async function sendMessage(req, res) {

  try {

    const senderId = req.user.id;

    const message = await sendMessageService({
      room_id: req.body.room_id,
      sender_id: senderId,
      receiver_id: req.body.receiver_id,
      content: req.body.content
    });

    res.json(message);

  } catch (err) {

    res.status(400).json({ message: err.message });

  }

}