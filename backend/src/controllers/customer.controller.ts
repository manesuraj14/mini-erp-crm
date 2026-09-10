import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { CustomerType, CustomerStatus } from '@prisma/client';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';

export const customerSchema = z.object({
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  mobileNumber: z.string().min(7, 'Valid mobile number is required'),
  email: z.string().email('Valid email is required'),
  businessName: z.string().min(2, 'Business name is required'),
  gstNumber: z.string().optional().nullable(),
  customerType: z.nativeEnum(CustomerType).default(CustomerType.RETAIL),
  address: z.string().min(3, 'Address is required'),
  status: z.nativeEnum(CustomerStatus).default(CustomerStatus.LEAD),
  followUpDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const getCustomers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const status = req.query.status as CustomerStatus | undefined;
    const customerType = req.query.type as CustomerType | undefined;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { businessName: { contains: search } },
        { mobileNumber: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (status && Object.values(CustomerStatus).includes(status)) {
      where.status = status;
    }

    if (customerType && Object.values(CustomerType).includes(customerType)) {
      where.customerType = customerType;
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({
      data: customers,
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

export const getCustomerById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        notesHistory: {
          include: {
            user: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        challans: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ customer });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    const existingMobile = await prisma.customer.findUnique({
      where: { mobileNumber: data.mobileNumber },
    });
    if (existingMobile) {
      return res.status(400).json({ error: 'Customer with this mobile number already exists' });
    }

    const existingEmail = await prisma.customer.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      return res.status(400).json({ error: 'Customer with this email address already exists' });
    }

    const customer = await prisma.customer.create({
      data: {
        ...data,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      },
    });

    res.status(201).json({ customer });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const data = req.body;

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...data,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      },
    });

    res.json({ customer });
  } catch (error) {
    next(error);
  }
};

export const addCustomerNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { noteText } = req.body;

    if (!noteText || typeof noteText !== 'string') {
      return res.status(400).json({ error: 'Note text is required' });
    }

    const note = await prisma.customerNote.create({
      data: {
        customerId: id,
        userId: req.user!.id,
        noteText,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });

    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
};