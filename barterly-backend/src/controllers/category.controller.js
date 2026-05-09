import * as categoryService from "../services/category.service.js";
import { successResponse } from "../utils/apiResponse.utils.js";


export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);

    return successResponse(
      res,
      201,
      "Category created successfully",
      category,
    );
  } catch (error) {
    next(error);
  }
};


export const getAllCategories = async (req, res, next) => {
  try {
    const filters = {
      isActive: req.query.isActive,
    };

    const categories = await categoryService.getAllCategories(filters);

    return successResponse(
      res,
      200,
      "Categories retrieved successfully",
      categories,
    );
  } catch (error) {
    next(error);
  }
};


export const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);

    return successResponse(
      res,
      200,
      "Category retrieved successfully",
      category,
    );
  } catch (error) {
    next(error);
  }
};


export const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);

    return successResponse(
      res,
      200,
      "Category retrieved successfully",
      category,
    );
  } catch (error) {
    next(error);
  }
};


export const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(
      req.params.id,
      req.body,
    );

    return successResponse(
      res,
      200,
      "Category updated successfully",
      category,
    );
  } catch (error) {
    next(error);
  }
};


export const deleteCategory = async (req, res, next) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);

    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};


export const toggleCategoryStatus = async (req, res, next) => {
  try {
    const category = await categoryService.toggleCategoryStatus(req.params.id);

    return successResponse(
      res,
      200,
      "Category status updated successfully",
      category,
    );
  } catch (error) {
    next(error);
  }
};


export const getCategoryStats = async (req, res, next) => {
  try {
    const stats = await categoryService.getCategoryStats();

    return successResponse(
      res,
      200,
      "Category statistics retrieved successfully",
      stats,
    );
  } catch (error) {
    next(error);
  }
};
