package measurementActions

import (
	// standard libs
	"net/http"

	// external libs
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm"

	//internal libs
	"schemaMeasurements"
)

type Measurement = schemaMeasurements.Measurement
type Response = schemaMeasurements.Response

func GetMeasurements(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		var measurements []Measurement

		db.Find(&measurements)
		c.JSON(http.StatusOK, measurements)
	}
}

func CreateMeasurement(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		var measurement Measurement
		c.BindJSON(&measurement)

		measurement.MeasurementID = uuid.New().String()

		err := db.Create(&measurement).Error
		if err != nil {
			response := &Response{Status: http.StatusBadRequest, TextStatus: err.Error()}
			c.AbortWithStatusJSON(http.StatusBadRequest, response)
			return
		} else {
			response := &Response{Status: http.StatusCreated, TextStatus: "Measurement created successfully"}
			c.JSON(http.StatusCreated, response)
		}
	}
}

func CreateMeasurementStruct(db *gorm.DB, measurement Measurement) error {
	d := Measurement{
		MeasurementID:    uuid.New().String(),
		DeviceID:         measurement.DeviceID,
		MeasurementValue: measurement.MeasurementValue,
		Timestamp:        measurement.Timestamp,
	}

	err := db.Create(&d).Error
	if err != nil {
		return err
	}

	return nil
}

func UpdateMeasurement(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		var measurement Measurement
		c.BindJSON(&measurement)

		MeasurementID := c.Params.ByName("mid")
		measurement.MeasurementID = MeasurementID

		err := db.Model(&Measurement{}).Where("measurement_id = ?", MeasurementID).Updates(measurement).Error
		if err != nil {
			response := &Response{Status: http.StatusBadRequest, TextStatus: err.Error()}
			c.AbortWithStatusJSON(http.StatusBadRequest, response)
			return
		} else {
			response := &Response{Status: http.StatusOK, TextStatus: "Measurement updated successfully"}
			c.JSON(http.StatusOK, response)
		}
	}
}

func GetMeasurement(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		MeasurementID := c.Params.ByName("mid")
		var measurement Measurement
		err := db.Where("measurement_id = ?", MeasurementID).First(&measurement).Error
		if err != nil {
			c.AbortWithStatus(http.StatusNotFound)
			return
		} else {
			c.JSON(http.StatusOK, measurement)
			return
		}
	}
}

func DeleteMeasurement(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		MeasurementID := c.Params.ByName("mid")

		err := db.Where("measurement_id = ?", MeasurementID).Delete(&Measurement{}).Error
		if err != nil {
			response := &Response{Status: http.StatusBadRequest, TextStatus: err.Error()}
			c.AbortWithStatusJSON(http.StatusBadRequest, response)
			return
		} else {
			response := &Response{Status: http.StatusOK, TextStatus: "Measurement deleted successfully"}
			c.JSON(http.StatusOK, response)
		}
	}
}
