import * as bookmarkService from "../services/bookmark.service.js";
import { successResponse } from "../utils/apiResponse.utils.js";

export const toggleBookmark = async (req, res, next) => {
  try {
    const result = await bookmarkService.toggleBookmark(
      req.user._id,
      req.params.skillId,
    );
    successResponse(res, 200, result.message, result);
  } catch (error) {
    next(error);
  }
};

export const getMyBookmarks = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await bookmarkService.getMyBookmarks(req.user._id, {
      page,
      limit,
    });
    successResponse(res, 200, "Bookmarks retrieved", result);
  } catch (error) {
    next(error);
  }
};

export const checkBookmarkStatus = async (req, res, next) => {
  try {
    const result = await bookmarkService.checkBookmarkStatus(
      req.user._id,
      req.params.skillId,
    );
    successResponse(res, 200, "Bookmark status retrieved", result);
  } catch (error) {
    next(error);
  }
};
