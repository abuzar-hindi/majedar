import { Category, slugify } from '../../models/Category.js';
import { MenuItem } from '../../models/MenuItem.js';
import { ConflictError, NotFoundError } from '../../utils/errors.js';
import { uploadImageBuffer, deleteCloudinaryImage } from '../uploads/image.service.js';

/**
 * Create a new category.
 */
export const createCategory = async (data, file = null) => {
    const name = data.name.trim();
    const slug = data.slug ? slugify(data.slug) : slugify(name);

    // Pre-check for duplicate name or slug
    const existing = await Category.findOne({
        $or: [{ name: new RegExp(`^${name}$`, 'i') }, { slug }],
    });
    if (existing) {
        throw new ConflictError('A category with this name or slug already exists');
    }

    let image = data.image || { url: null, publicId: null };
    if (file && file.buffer) {
        image = await uploadImageBuffer(file.buffer, 'majedar/categories');
    }

    const category = new Category({
        name,
        slug,
        image,
        isActive: data.isActive !== undefined ? data.isActive : true,
    });

    try {
        await category.save();
    } catch (error) {
        if (error.code === 11000) {
            throw new ConflictError('A category with this name or slug already exists');
        }
        throw error;
    }

    return category;
};

/**
 * Get all categories (optional active-only filter).
 */
export const getAllCategories = async ({ onlyActive = false } = {}) => {
    const filter = {};
    if (onlyActive) {
        filter.isActive = true;
    }

    const categories = await Category.find(filter).sort({ name: 1 });
    return categories;
};

/**
 * Get category by ID.
 */
export const getCategoryById = async (id) => {
    const category = await Category.findById(id);
    if (!category) {
        throw new NotFoundError('Category not found');
    }
    return category;
};

/**
 * Update an existing category.
 */
export const updateCategory = async (id, updates, file = null) => {
    const category = await Category.findById(id);
    if (!category) {
        throw new NotFoundError('Category not found');
    }

    // If name or slug is being updated, verify uniqueness
    if (updates.name || updates.slug) {
        const newName = updates.name ? updates.name.trim() : category.name;
        const newSlug = updates.slug ? slugify(updates.slug) : (updates.name ? slugify(newName) : category.slug);

        const duplicate = await Category.findOne({
            _id: { $ne: id },
            $or: [{ name: new RegExp(`^${newName}$`, 'i') }, { slug: newSlug }],
        });
        if (duplicate) {
            throw new ConflictError('Another category with this name or slug already exists');
        }

        category.name = newName;
        category.slug = newSlug;
    }

    if (updates.isActive !== undefined) {
        category.isActive = updates.isActive;
    }

    // Handle image update
    if (file && file.buffer) {
        const newImage = await uploadImageBuffer(file.buffer, 'majedar/categories');
        if (category.image?.publicId) {
            await deleteCloudinaryImage(category.image.publicId);
        }
        category.image = newImage;
    } else if (updates.image !== undefined) {
        if (category.image?.publicId && category.image.publicId !== updates.image?.publicId) {
            await deleteCloudinaryImage(category.image.publicId);
        }
        category.image = updates.image;
    }

    try {
        await category.save();
    } catch (error) {
        if (error.code === 11000) {
            throw new ConflictError('Another category with this name or slug already exists');
        }
        throw error;
    }

    return category;
};

/**
 * Delete a category safely.
 * Rejects deletion if any MenuItem references it to preserve database referential integrity.
 */
export const deleteCategory = async (id) => {
    const category = await Category.findById(id);
    if (!category) {
        throw new NotFoundError('Category not found');
    }

    const linkedItemsCount = await MenuItem.countDocuments({ category: id });
    if (linkedItemsCount > 0) {
        throw new ConflictError(
            `Cannot delete category: ${linkedItemsCount} menu item(s) are linked to it. Please reassign or delete the items first, or deactivate the category.`
        );
    }

    if (category.image?.publicId) {
        await deleteCloudinaryImage(category.image.publicId);
    }

    await Category.findByIdAndDelete(id);
    return { id, name: category.name };
};
