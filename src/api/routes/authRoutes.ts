import { Router } from "express";
import { login, refresh, signUp } from "../controllers/auth.controller";
import { auth } from "../../utils/auth";

const router=Router();
router.post('/signup',signUp);
router.post('/login',login);
router.get('/refresh',refresh);
router.get('/test', auth, (req,res)=>{
    res.send("Super Secret Data");
});

export default router;