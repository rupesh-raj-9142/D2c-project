import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { products: true } }
      }
    });

    const formatted = categories.map((c) => ({
      id: c.slug.replace('-pickle', ''),
      dbId: c.id,
      name: c.name,
      hindi: c.hindiName || '',
      shortDesc: c.shortDesc || '',
      image: c.image || '/assets/images/hero-pickle.jpg',
      tag: c.tag || '',
      productCount: c._count.products
    }));

    return sendSuccess(res, formatted, 'Categories loaded');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch categories', 500);
  }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const { name, hindiName, slug, shortDesc, image, tag } = req.body;
    const catSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const created = await prisma.category.create({
      data: { name, hindiName, slug: catSlug, shortDesc, image, tag }
    });

    return sendSuccess(res, created, 'Category created', 201);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to create category', 500);
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const updated = await prisma.category.update({
      where: { id },
      data: req.body
    });
    return sendSuccess(res, updated, 'Category updated');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update category', 500);
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await prisma.category.delete({ where: { id } });
    return sendSuccess(res, null, 'Category deleted');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to delete category', 500);
  }
}
