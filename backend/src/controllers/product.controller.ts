import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { MovementType } from '@prisma/client';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(2, 'SKU is required'),
  category: z.string().min(2, 'Category is required'),
  unitPrice: z.number().positive('Unit price must be positive'),
  currentStock: z.number().int().min(0, 'Current stock cannot be negative').default(0),
  minStockAlert: z.number().int().min(1, 'Min stock alert must be at least 1').default(10),
  locationWarehouse: z.string().min(2, 'Warehouse location is required'),
  imageUrl: z.string().optional().nullable(),
});

export const stockAdjustmentSchema = z.object({
  quantity: z.number().int().positive('Quantity must be greater than zero'),
  movementType: z.nativeEnum(MovementType),
  reason: z.string().min(3, 'Reason is required for inventory audit'),
});

export const getProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const category = req.query.category as string | undefined;
    const lowStock = req.query.lowStock === 'true';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { category: { contains: search } },
        { locationWarehouse: { contains: search } },
      ];
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    let products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    if (lowStock) {
      products = products.filter((p) => p.currentStock <= p.minStockAlert);
    }

    const total = products.length;
    const paginated = products.slice(skip, skip + limit);

    res.json({
      data: paginated,
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

export const getProductById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockLogs: {
          include: {
            createdBy: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku },
    });
    if (existingSku) {
      return res.status(400).json({ error: `Product with SKU "${data.sku}" already exists` });
    }

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data,
      });

      if (data.currentStock > 0) {
        await tx.stockMovementLog.create({
          data: {
            productId: created.id,
            quantityChanged: data.currentStock,
            movementType: MovementType.IN,
            reason: 'Initial Opening Stock Entry',
            createdById: req.user!.id,
          },
        });
      }

      return created;
    });

    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const data = req.body;

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    res.json({ product });
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { quantity, movementType, reason } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id } });

      if (!product) {
        throw { statusCode: 404, message: 'Product not found' };
      }

      if (movementType === MovementType.OUT && product.currentStock < quantity) {
        throw {
          statusCode: 400,
          message: `Insufficient stock! Cannot deduct ${quantity} units. Available in warehouse: ${product.currentStock}. Stock cannot go negative.`,
        };
      }

      const updated = await tx.product.update({
        where: { id },
        data: {
          currentStock:
            movementType === MovementType.IN
              ? { increment: quantity }
              : { decrement: quantity },
        },
      });

      const log = await tx.stockMovementLog.create({
        data: {
          productId: id,
          quantityChanged: quantity,
          movementType,
          reason,
          createdById: req.user!.id,
        },
      });

      return { product: updated, log };
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getStockLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      prisma.stockMovementLog.count(),
      prisma.stockMovementLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          createdBy: { select: { id: true, name: true, role: true } },
        },
      }),
    ]);

    res.json({
      data: logs,
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