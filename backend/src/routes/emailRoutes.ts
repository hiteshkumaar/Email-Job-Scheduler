import { Router } from 'express';
import multer from 'multer';
import { scheduleEmails, getScheduledEmails, getSentEmails } from '../controllers/emailController';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/schedule', upload.single('file'), scheduleEmails);
router.get('/scheduled', getScheduledEmails);
router.get('/sent', getSentEmails);

export default router;
