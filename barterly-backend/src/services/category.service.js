import Category from "../models/Category.model.js";
import { AppError } from "../utils/apiResponse.utils.js";

/**
 * Create a new category
 * @param {Object} categoryData - Category data
 * @returns {Object} Created category
 */
export const createCategory = async (categoryData) => {
  const category = await Category.create(categoryData);
  return category;
};

/**
 * Get all categories
 * @param {Object} filters - Filter options
 * @returns {Array} Categories
 */
export const getAllCategories = async (filters = {}) => {
  const query = {};

  // Filter by active status
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  } else {
    // By default, only show active categories
    query.isActive = true;
  }

  const categories = await Category.find(query).sort({ name: 1 }).lean();

  return categories;
};

/**
 * Get category by ID
 * @param {String} categoryId - Category ID
 * @returns {Object} Category details
 */
export const getCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

/**
 * Get category by slug
 * @param {String} slug - Category slug
 * @returns {Object} Category details
 */
export const getCategoryBySlug = async (slug) => {
  const category = await Category.findOne({ slug, isActive: true });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

/**
 * Update category
 * @param {String} categoryId - Category ID
 * @param {Object} updateData - Fields to update
 * @returns {Object} Updated category
 */
export const updateCategory = async (categoryId, updateData) => {
  const category = await Category.findByIdAndUpdate(categoryId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

/**
 * Delete category
 * @param {String} categoryId - Category ID
 */
export const deleteCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  // Check if category has skills
  if (category.skillCount > 0) {
    throw new AppError(
      "Cannot delete category with existing skills. Please reassign skills first.",
      400,
    );
  }

  await Category.findByIdAndDelete(categoryId);

  return { message: "Category deleted successfully" };
};

/**
 * Toggle category active status
 * @param {String} categoryId - Category ID
 * @returns {Object} Updated category
 */
export const toggleCategoryStatus = async (categoryId) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  category.isActive = !category.isActive;
  await category.save();

  return category;
};

/**
 * Get category statistics
 * @returns {Object} Statistics
 */
export const getCategoryStats = async () => {
  const [total, active, inactive] = await Promise.all([
    Category.countDocuments(),
    Category.countDocuments({ isActive: true }),
    Category.countDocuments({ isActive: false }),
  ]);

  // Get top categories by skill count
  const topCategories = await Category.find({ isActive: true })
    .sort({ skillCount: -1 })
    .limit(10)
    .select("name slug skillCount icon");

  return {
    total,
    active,
    inactive,
    topCategories,
  };
};
