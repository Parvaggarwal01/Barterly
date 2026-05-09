import * as barterService from "../services/barter.service.js";
import { successResponse } from "../utils/apiResponse.utils.js";


export const createBarterRequest = async (req, res, next) => {
  console.log("🎯 Controller reached");
  console.log("🎯 next is a function?", typeof next === "function");
  try {
    const barter = await barterService.createBarterRequest(
      req.body,
      req.user._id.toString(),
    );

    return successResponse(
      res,
      201,
      "Barter request sent successfully",
      barter,
    );
  } catch (error) {
    console.log("❌ Controller error:", error.message);
    next(error);
  }
};


export const getMyBarters = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      type: req.query.type || "all",
    };

    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      sortBy: req.query.sortBy || "createdAt",
      order: req.query.order || "desc",
    };

    const result = await barterService.getMyBarters(
      req.user._id,
      filters,
      options,
    );

    return successResponse(
      res,
      200,
      "Barter requests retrieved successfully",
      result,
    );
  } catch (error) {
    next(error);
  }
};


export const getBarterById = async (req, res, next) => {
  try {
    const barter = await barterService.getBarterById(
      req.params.id,
      req.user._id,
    );

    return successResponse(
      res,
      200,
      "Barter request retrieved successfully",
      barter,
    );
  } catch (error) {
    next(error);
  }
};


export const acceptBarter = async (req, res, next) => {
  try {
    const barter = await barterService.acceptBarter(
      req.params.id,
      req.user._id,
    );

    return successResponse(res, 200, "Barter request accepted", barter);
  } catch (error) {
    next(error);
  }
};


export const rejectBarter = async (req, res, next) => {
  try {
    const barter = await barterService.rejectBarter(
      req.params.id,
      req.user._id,
      req.body.reason,
    );

    return successResponse(res, 200, "Barter request rejected", barter);
  } catch (error) {
    next(error);
  }
};


export const counterOffer = async (req, res, next) => {
  try {
    const barter = await barterService.counterOffer(
      req.params.id,
      req.user._id,
      req.body,
    );

    return successResponse(res, 200, "Counter offer sent successfully", barter);
  } catch (error) {
    next(error);
  }
};


export const cancelBarter = async (req, res, next) => {
  try {
    const barter = await barterService.cancelBarter(
      req.params.id,
      req.user._id,
    );

    return successResponse(res, 200, "Barter request cancelled", barter);
  } catch (error) {
    next(error);
  }
};


export const completeBarter = async (req, res, next) => {
  try {
    const barter = await barterService.completeBarter(
      req.params.id,
      req.user._id,
    );

    return successResponse(
      res,
      200,
      "Barter marked as completed successfully",
      barter,
    );
  } catch (error) {
    next(error);
  }
};


export const getBarterStats = async (req, res, next) => {
  try {
    const stats = await barterService.getBarterStats(req.user._id);

    return successResponse(
      res,
      200,
      "Statistics retrieved successfully",
      stats,
    );
  } catch (error) {
    next(error);
  }
};
