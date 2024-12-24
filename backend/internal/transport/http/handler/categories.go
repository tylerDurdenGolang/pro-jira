package handler

import (
	"github.com/tank130701/course-work/todo-app/back-end/internal/errs"
	"github.com/tank130701/course-work/todo-app/back-end/internal/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary Create todo list
// @Security ApiKeyAuth
// @Tags lists
// @Description create todo list
// @ID create-list
// @Accept  json
// @Produce  json
// @Param input body models.TodoCategory true "list info"
// @Success 200 {integer} integer 1
// @Failure 400,404 {object} errs.errorResponse
// @Failure 500 {object} errs.errorResponse
// @Failure default {object} errs.errorResponse
// @Router /api/lists [post]
func (h *Handler) createCategory(c *gin.Context) {
	userId, err := getUserId(c)
	if err != nil {
		errs.NewErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	var input categoryInput
	if err := c.BindJSON(&input); err != nil {
		errs.NewErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	id, err := h.services.TodoCategory.Create(userId, input.Name)
	if err != nil {
		errs.NewErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"id": id,
	})
}

type categoryInput struct {
	Name string `json:"name" binding:"required"`
	//UserId int    `json:"user_id" binding:"required"`
}

type getAllListsResponse struct {
	Data []models.TodoCategory `json:"data"`
}

// @Summary Get All Lists
// @Security ApiKeyAuth
// @Tags lists
// @Description get all lists
// @ID get-all-lists
// @Accept  json
// @Produce  json
// @Success 200 {object} getAllListsResponse
// @Failure 400,404 {object} errs.errorResponse
// @Failure 500 {object} errs.errorResponse
// @Failure default {object} errs.errorResponse
// @Router /api/lists [get]
func (h *Handler) getAllLists(c *gin.Context) {
	userId, err := getUserId(c)
	if err != nil {
		errs.NewErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	lists, err := h.services.TodoCategory.GetAll(userId)
	if err != nil {
		errs.NewErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, getAllListsResponse{
		Data: lists,
	})
}

// @Summary Get List By Id
// @Security ApiKeyAuth
// @Tags lists
// @Description get list by id
// @ID get-list-by-id
// @Accept  json
// @Produce  json
// @Success 200 {object} models.TodoCategory
// @Failure 400,404 {object} errs.errorResponse
// @Failure 500 {object} errs.errorResponse
// @Failure default {object} errs.errorResponse
// @Router /api/lists/:id [get]
func (h *Handler) getCategoryById(c *gin.Context) {
	//userId, err := getUserId(c)
	//if err != nil {
	//	errs.NewErrorResponse(c, http.StatusInternalServerError, err.Error())
	//	return
	//}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		errs.NewErrorResponse(c, http.StatusBadRequest, "invalid id param")
		return
	}

	list, err := h.services.TodoCategory.GetById(id)
	if err != nil {
		errs.NewErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, list)
}

// @Summary Update Category
// @Security ApiKeyAuth
// @Tags categories
// @Description update category by id
// @ID update-category
// @Accept  json
// @Produce  json
// @Param id path int true "Category ID"
// @Param body body models.UpdateTodoCategory true "Update Category Body"
// @Success 200 {object} errs.StatusResponse
// @Failure 400,404 {object} errs.errorResponse
// @Failure 500 {object} errs.errorResponse
// @Failure default {object} errs.errorResponse
// @Router /api/categories/:id [put]
func (h *Handler) updateCategory(c *gin.Context) {
	userId, err := getUserId(c)
	if err != nil {
		errs.NewErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		errs.NewErrorResponse(c, http.StatusBadRequest, "invalid id param")
		return
	}

	var input models.UpdateTodoCategory
	if err := c.BindJSON(&input); err != nil {
		errs.NewErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.services.TodoCategory.Update(userId, id, input); err != nil {
		errs.NewErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, errs.StatusResponse{Status: "ok"})
}

// @Summary Delete Category
// @Security ApiKeyAuth
// @Tags categories
// @Description delete category by name
// @ID delete-category
// @Accept  json
// @Produce  json
// @Param name path string true "Category Name"
// @Success 200 {object} errs.StatusResponse
// @Failure 400,404 {object} errs.errorResponse
// @Failure 500 {object} errs.errorResponse
// @Failure default {object} errs.errorResponse
// @Router /api/categories/:name [delete]
func (h *Handler) deleteCategory(c *gin.Context) {
	userId, err := getUserId(c)
	if err != nil {
		errs.NewErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		errs.NewErrorResponse(c, http.StatusBadRequest, "invalid name param")
		return
	}

	err = h.services.TodoCategory.Delete(userId, id)
	if err != nil {
		errs.NewErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, errs.StatusResponse{
		Status: "ok",
	})
}

//func (h *Handler) deleteCategory(c *gin.Context) {
//	userId, err := getUserId(c)
//	if err != nil {
//		errs.NewErrorResponse(c, http.StatusInternalServerError, err.Error())
//		return
//	}
//
//	var requestBody struct {
//		Name string `json:"name"`
//	}
//	if err := c.BindJSON(&requestBody); err != nil {
//		errs.NewErrorResponse(c, http.StatusBadRequest, "invalid request body")
//		return
//	}
//
//	err = h.services.TodoCategory.Delete(userId, requestBody.Name)
//	if err != nil {
//		errs.NewErrorResponse(c, http.StatusInternalServerError, err.Error())
//		return
//	}
//
//	c.JSON(http.StatusOK, errs.StatusResponse{
//		Status: "ok",
//	})
//}
