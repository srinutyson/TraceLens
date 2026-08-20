import express from 'express';
import  ingestSpan from '../controllers/ingestController.js';
import { getTraces,getTracesById } from '../controllers/traceController.js';
import { protectAuth } from '../middleware/protectAuth.js';
import evalIngestion from '../controllers/evalController.js';
import { createProject , getProjects } from '../controllers/projectController.js';
import { requiresAuth } from '../middleware/authMiddleware.js';
import { authorizeProject } from '../middleware/authorizeProject.js';
const router = express.Router();

router.post('/ingest',protectAuth, ingestSpan);
router.get('/projects/:projectId/traces',requiresAuth,authorizeProject, getTraces);
router.get('/projects/:projectId/traces/:traceId',requiresAuth,authorizeProject, getTracesById);
router.post('/projects/:projectId/traces/:traceId/eval',requiresAuth,authorizeProject,evalIngestion);
router.post('/projects',requiresAuth,createProject);
router.get('/projects', requiresAuth,getProjects);

export default router;
