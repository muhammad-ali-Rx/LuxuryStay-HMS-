import express from "express";
import{
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    loginUser,


} from '../Controller/UserController.mjs';
import { auth }  from "../middleware/auth.mjs";

const router = express.Router();

router.get('/', getAllUsers);
router.post('/add', createUser);
router.put('/update/:id', updateUser);
router.delete('/delete/:id', deleteUser);
router.get('/protected', auth , (req , res)=>res.send('hello'));
router.get('/:id', searchUsers);    
router.post('/login',  loginUser);
export default router;

