package deviceActions

import (
	// standard libs
	"net/http"

	// external libs
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm"

	//internal libs
	"schemaDevices"
)

type Device = schemaDevices.Device
type Response = schemaDevices.Response

func GetDevices(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		var devices []Device

		db.Find(&devices)
		c.JSON(http.StatusOK, devices)
	}
}

func CreateDevice(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		var device Device
		c.BindJSON(&device)

		device.DeviceID = uuid.New().String()

		err := db.Create(&device).Error
		if err != nil {
			response := &Response{Status: http.StatusBadRequest, TextStatus: err.Error()}
			c.AbortWithStatusJSON(http.StatusBadRequest, response)
			return
		} else {
			response := &Response{Status: http.StatusCreated, TextStatus: "Device created successfully"}
			c.JSON(http.StatusCreated, response)
		}
	}
}

func GetDevice(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		DeviceID := c.Params.ByName("did")
		var device Device
		err := db.Where("device_id = ?", DeviceID).First(&device).Error
		if err != nil {
			c.AbortWithStatus(http.StatusNotFound)
			return
		} else {
			c.JSON(http.StatusOK, device)
			return
		}
	}
}

func UpdateDevice(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		var device Device
		DeviceID := c.Params.ByName("did")

		if err := db.Where("device_id = ?", DeviceID).First(&device).Error; err != nil {
			response := &Response{Status: http.StatusNotFound, TextStatus: "Device not found"}
			c.JSON(http.StatusNotFound, response)
			return
		}

		c.BindJSON(&device)

		db.Save(&device)

		response := &Response{Status: http.StatusOK, TextStatus: "Device updated successfully"}
		c.JSON(http.StatusOK, response)
	}
}

func DeleteDevice(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		var device Device
		DeviceID := c.Params.ByName("did")

		if err := db.Where("device_id = ?", DeviceID).First(&device).Error; err != nil {
			response := &Response{Status: http.StatusNotFound, TextStatus: "Device not found"}
			c.JSON(http.StatusNotFound, response)
			return
		}

		db.Delete(&device)

		response := &Response{Status: http.StatusOK, TextStatus: "Device deleted successfully"}
		c.JSON(http.StatusOK, response)
	}
}
