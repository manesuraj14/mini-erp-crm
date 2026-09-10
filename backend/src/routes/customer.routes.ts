import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  addCustomerNote,
  customerSchema,
} from '../controllers/customer.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validate';

const router = Router();

router.use(authenticateJWT);

router.get('/', authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS), getCustomers);
router.get('/:id', authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS), getCustomerById);

router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES),
  validateRequest(customerSchema),
  createCustomer
);

router.put(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.SALES),
  validateRequest(customerSchema.partial()),
  updateCustomer
);

router.post(
  '/:id/notes',
  authorizeRoles(Role.ADMIN, Role.SALES),
  addCustomerNote
);

export default router;