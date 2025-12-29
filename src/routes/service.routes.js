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

// Use 'protect' from your auth middleware
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Public routes
router.get('/', getAllServices);
router.get('/recommended', protect, getRecommendedServices); // Line 22 - now fixed
router.get('/:id', getServiceById);

// Protected routes
router.post('/', protect, authorize('admin', 'decorator'), createService);
router.put('/:id', protect, authorize('admin', 'decorator'), updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);

module.exports = router;