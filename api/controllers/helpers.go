package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

func parseIntParam(c *gin.Context, name string) (int, error) {
	return strconv.Atoi(c.Param(name))
}
