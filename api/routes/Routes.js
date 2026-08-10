import express from 'express';
import { ingestSpan } from '../controllers/ingestController.js';
import { getTraces,getTracesById } from '../controllers/traceController.js';
import { protectAuth } from '../middleware/protectAuth.js';
const router = express.Router();

router.post('/ingest',protectAuth, ingestSpan);
router.get('/traces',protectAuth, getTraces);
router.get('/traces/:traceId',protectAuth, getTracesById);



export default router;
