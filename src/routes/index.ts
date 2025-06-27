import { Router } from 'express';
import authRoutes from './authRoutes';
import postRoutes from './postRoutes';

const v1Router = Router();

// API routes
v1Router.use('/auth', authRoutes);
v1Router.use('/posts', postRoutes);

// check endpoint
v1Router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});


const router = Router();

// Versioned entry point
router.use('/v1', v1Router);


export default router;