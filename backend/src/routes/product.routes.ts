import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  adjustStock,
  getStockLogs,
  productSchema,
  stockAdjustmentSchema,
} from '../controllers/product.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validate';

const router = Router();

router.use(authenticateJWT);

router.get('/', getProducts);
router.get('/stock-logs', authorizeRoles(Role.ADMIN, Role.WAREHOUSE, Role.ACCOUNTS), getStockLogs);
router.get('/:id', getProductById);

router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  validateRequest(productSchema),
  createProduct
);

router.put(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  validateRequest(productSchema.partial()),
  updateProduct
);

router.post(
  '/:id/stock-movement',
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  validateRequest(stockAdjustmentSchema),
  adjustStock
);

export default router;