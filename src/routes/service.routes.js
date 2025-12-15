const express = require('express');
const router = express.Router();
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getRecommendedServices
} = require('../controllers/service.controller');
const { authenticateJWT, optionalAuth } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validateService, validateObjectId, validate } = require('../middleware/validation.middleware');

// Public routes
router.get('/', getAllServices);
router.get('/recommended', authenticateJWT, getRecommendedServices);
router.get('/:id', validateObjectId, validate, getServiceById);

// Protected routes
router.post('/', authenticateJWT, authorize('admin', 'decorator'), validateService, validate, createService);
router.put('/:id', authenticateJWT, authorize('admin', 'decorator'), validateObjectId, validate, updateService);
router.delete('/:id', authenticateJWT, authorize('admin'), validateObjectId, validate, deleteService);

module.exports = router;