import express from "express";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
} from "../Controller/RoomController.mjs";
import { upload } from "../Config/cloudinary.config.mjs"; 

const router = express.Router();

router.get("/show", getAllRooms);
router.post("/add", upload.array("images"), createRoom);
router.get("/:id", getRoomById);
router.put("/update/:id", upload.array("images"),  updateRoom);
router.delete("/delete/:id", deleteRoom);
router.put("/status/:id", updateRoomStatus);

export default router;
