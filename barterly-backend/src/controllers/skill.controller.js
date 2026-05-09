import * as skillService from "../services/skill.service.js";
import { successResponse } from "../utils/apiResponse.utils.js";


export const createSkill = async (req, res, next) => {
  try {
    const skill = await skillService.createSkill(req.body, req.user._id);

    return successResponse(res, 201, "Skill created successfully", skill);
  } catch (error) {
    next(error);
  }
};


export const getAllSkills = async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      level: req.query.level,
      deliveryMode: req.query.deliveryMode,
      search: req.query.search,
    };

    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await skillService.getAllSkills(filters, options);

    return successResponse(res, 200, "Skills retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};


export const getSkillById = async (req, res, next) => {
  try {
    const skill = await skillService.getSkillById(req.params.id);

    return successResponse(res, 200, "Skill retrieved successfully", skill);
  } catch (error) {
    next(error);
  }
};


export const updateSkill = async (req, res, next) => {
  try {
    const skill = await skillService.updateSkill(
      req.params.id,
      req.body,
      req.user._id,
    );

    return successResponse(res, 200, "Skill updated successfully", skill);
  } catch (error) {
    next(error);
  }
};


export const deleteSkill = async (req, res, next) => {
  try {
    const result = await skillService.deleteSkill(
      req.params.id,
      req.user._id,
    );

    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};


export const getMySkills = async (req, res, next) => {
  try {
    const skills = await skillService.getUserSkills(req.user._id);

    return successResponse(
      res,
      200,
      "Your skills retrieved successfully",
      skills,
    );
  } catch (error) {
    next(error);
  }
};


export const getUserSkills = async (req, res, next) => {
  try {
    const skills = await skillService.getUserSkills(req.params.userId);

    return successResponse(res, 200, "User skills retrieved successfully", {
      skills,
    });
  } catch (error) {
    next(error);
  }
};


export const getAllSkillsAdmin = async (req, res, next) => {
  try {
    const filters = {
      verificationStatus: req.query.verificationStatus,
      category: req.query.category,
      isActive: req.query.isActive,
      search: req.query.search,
    };

    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await skillService.getAllSkillsAdmin(filters, options);


    return successResponse(res, 200, "Skills retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};


export const updateSkillVerification = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const skill = await skillService.updateSkillVerification(
      req.params.id,
      status,
      note,
    );

    return successResponse(
      res,
      200,
      "Skill verification status updated successfully",
      skill,
    );
  } catch (error) {
    next(error);
  }
};


export const getSkillStats = async (req, res, next) => {
  try {
    const stats = await skillService.getSkillStats();

    return successResponse(
      res,
      200,
      "Skill statistics retrieved successfully",
      stats,
    );
  } catch (error) {
    next(error);
  }
};
