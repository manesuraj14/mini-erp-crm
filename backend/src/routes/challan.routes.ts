import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  getChallans,
  getChallanById,
  createChallan,
  confirmChallan,
  cancelChallan,
  createChallanSchema,
} from '../controllers/challan.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validate';

const router = Router();

router.use(authenticateJWT);

router.get('/', authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS), getChallans);
router.get('/:id', authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS), getChallanById);

router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES),
  validateRequest(createChallanSchema),
  createChallan
);

router.put(
  '/:id/confirm',
  authorizeRoles(Role.ADMIN, Role.SALES),
  confirmChallan
);

router.put(
  '/:id/cancel',
  authorizeRoles(Role.ADMIN, Role.SALES),
  cancelChallan
);

export default router;