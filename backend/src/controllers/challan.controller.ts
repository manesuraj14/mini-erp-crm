import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { ChallanStatus, MovementType } from '@prisma/client';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';

export const createChallanSchema = z.object({
  customerId: z.string().min(1, 'Valid customer ID is required'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Valid product ID is required'),
        quantity: z.number().int().positive('Quantity must be greater than zero'),
      })
    )
    .min(1, 'At least one product is required in the challan'),
  status: z.nativeEnum(ChallanStatus).default(ChallanStatus.DRAFT),
});

export const getChallans = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const search = (req.query.search as string) || '';
    const status = req.query.status as ChallanStatus | undefined;
    const customerId = req.query.customerId as string | undefined;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { challanNumber: { contains: search } },
        { customer: { customerName: { contains: search } } },
        { customer: { businessName: { contains: search } } },
      ];
    }

    if (status && Object.values(ChallanStatus).includes(status)) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const [total, challans] = await Promise.all([
      prisma.challan.count({ where }),
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              customerName: true,
              businessName: true,
              mobileNumber: true,
              email: true,
              gstNumber: true,
            },
          },
          createdBy: { select: { id: true, name: true, role: true } },
          items: true,
        },
      }),
    ]);

    res.json({
      data: challans,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getChallanById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true, role: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true, currentStock: true } },
          },
        },
      },
    });

    if (!challan) {
      return res.status(404).json({ error: 'Challan not found' });
    }

    res.json({ challan });
  } catch (error) {
    next(error);
  }
};

export const createChallan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { customerId, items, status } = req.body;

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const now = new Date();
    const count = await prisma.challan.count();
    const challanNumber = `CH-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      count + 1
    ).padStart(4, '0')}`;

    const result = await prisma.$transaction(async (tx) => {
      const itemSnapshots = [];
      let totalQuantity = 0;
      let totalAmount = 0;

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw { statusCode: 404, message: `Product not found: ${item.productId}` };
        }

        if (status === ChallanStatus.CONFIRMED && product.currentStock < item.quantity) {
          throw {
            statusCode: 400,
            message: `Insufficient stock for "${product.name}" (SKU: ${product.sku}). Available: ${product.currentStock}, Requested: ${item.quantity}. Stock cannot go negative!`,
          };
        }

        const unitPrice = Number(product.unitPrice);
        const subtotal = Number((unitPrice * item.quantity).toFixed(2));

        itemSnapshots.push({
          productId: product.id,
          snapshotProductName: product.name,
          snapshotSku: product.sku,
          snapshotUnitPrice: unitPrice,
          quantity: item.quantity,
          subtotal,
        });

        totalQuantity += item.quantity;
        totalAmount += subtotal;
      }

      const createdChallan = await tx.challan.create({
        data: {
          challanNumber,
          customerId,
          totalQuantity,
          totalAmount: Number(totalAmount.toFixed(2)),
          status,
          createdById: req.user!.id,
          confirmedAt: status === ChallanStatus.CONFIRMED ? now : null,
          items: {
            create: itemSnapshots,
          },
        },
        include: {
          items: true,
          customer: true,
        },
      });

      if (status === ChallanStatus.CONFIRMED) {
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });

          await tx.stockMovementLog.create({
            data: {
              productId: item.productId,
              quantityChanged: item.quantity,
              movementType: MovementType.OUT,
              reason: `Sales Challan Confirmation #${challanNumber}`,
              createdById: req.user!.id,
            },
          });
        }
      }

      return createdChallan;
    });

    res.status(201).json({ challan: result });
  } catch (error) {
    next(error);
  }
};

export const confirmChallan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const result = await prisma.$transaction(async (tx) => {
      const challan = (await tx.challan.findUnique({
        where: { id },
        include: { items: true },
      })) as any;

      if (!challan) {
        throw { statusCode: 404, message: 'Challan not found' };
      }

      if (challan.status === ChallanStatus.CONFIRMED) {
        throw { statusCode: 400, message: 'Challan is already confirmed' };
      }

      if (challan.status === ChallanStatus.CANCELLED) {
        throw { statusCode: 400, message: 'Cannot confirm a cancelled challan' };
      }

      for (const item of challan.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw {
            statusCode: 404,
            message: `Product "${item.snapshotProductName}" no longer exists in catalog`,
          };
        }

        if (product.currentStock < item.quantity) {
          throw {
            statusCode: 400,
            message: `Insufficient stock for "${item.snapshotProductName}" (SKU: ${item.snapshotSku}). Available: ${product.currentStock}, Requested: ${item.quantity}. Cannot confirm challan!`,
          };
        }
      }

      for (const item of challan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { decrement: item.quantity } },
        });

        await tx.stockMovementLog.create({
          data: {
            productId: item.productId,
            quantityChanged: item.quantity,
            movementType: MovementType.OUT,
            reason: `Sales Challan Confirmation #${challan.challanNumber}`,
            createdById: req.user!.id,
          },
        });
      }

      const updatedChallan = await tx.challan.update({
        where: { id },
        data: {
          status: ChallanStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
        include: {
          items: true,
          customer: true,
        },
      });

      return updatedChallan;
    });

    res.json({ challan: result });
  } catch (error) {
    next(error);
  }
};

export const cancelChallan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const challan = await prisma.challan.findUnique({ where: { id } });
    if (!challan) {
      return res.status(404).json({ error: 'Challan not found' });
    }

    if (challan.status === ChallanStatus.CONFIRMED) {
      return res.status(400).json({
        error: 'Cannot cancel an already confirmed challan. Dispatch has already occurred.',
      });
    }

    const updated = await prisma.challan.update({
      where: { id },
      data: { status: ChallanStatus.CANCELLED },
    });

    res.json({ challan: updated });
  } catch (error) {
    next(error);
  }
};