package main

import (
	// standard libs
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	// external libs
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres" // driver for postgres
	amqp "github.com/rabbitmq/amqp091-go"

	// "github.com/joho/godotenv"

	// internal libs
	"measurementActions"
	"schemaMeasurements"
)

type Measurement = schemaMeasurements.Measurement
type Response = schemaMeasurements.Response
type DeviceConsumption struct {
	HourlyMeasurement float64
	MaxHC             float64
}

type Reading struct {
	DeviceID         string  `json:"device_id"`
	MeasurementValue float64 `json:"measurement_value"`
	Timestamp        uint    `json:"timestamp"`
}

var (
	db  *gorm.DB
	err error
)

// func init() {

// 	err := godotenv.Load(".env")

// 	if err != nil {
// 		log.Fatal("Error loading .env file")
// 	}
// }

func rabbitMQ(rabbitMQString string) (<-chan amqp.Delivery, error, *amqp.Connection, *amqp.Channel) {
	connection, err := amqp.Dial(rabbitMQString)
	if err != nil {
		return nil, err, nil, nil
	}

	channel, err := connection.Channel()
	if err != nil {
		return nil, err, nil, nil
	}

	queue, err := channel.QueueDeclare(
		"q1",  // name
		false, // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,
	)
	if err != nil {
		return nil, err, nil, nil
	}

	deliveries, err := channel.Consume(
		queue.Name, // queue
		"",         // consumer
		true,       // auto-ack
		false,      // exclusive
		false,      // no-local
		false,      // no-wait
		nil,        // args
	)
	if err != nil {
		return nil, err, nil, nil
	}

	return deliveries, nil, connection, channel
}

func goroutine(f func()) func() {
	return func() {
		go f()
	}
}

// func getCurrentMinute() int {
// 	return time.Now().Minute()
// }

// type Measurement struct {
// 	MeasurementID    string  `json:"measurement_id" gorm:"column:measurement_id;type:varchar(40);primary_key;unique"`
// 	DeviceID         string  `json:"device_id" gorm:"column:device_id;type:uuid"`
// 	Timestamp        int64   `json:"timestamp" gorm:"column:timestamp;type:bigint"`
// 	MeasurementValue float64 `json:"measurement_value" gorm:"column:measurement_value;type:decimal"`
// }

func processDeviceData(deviceData map[string]DeviceConsumption, db *gorm.DB) {

	for device := range deviceData {
		// Create and save a new DeviceReadings object

		d := Measurement{
			MeasurementID:    uuid.New().String(),
			DeviceID:         device,
			MeasurementValue: deviceData[device].HourlyMeasurement,
			Timestamp:        time.Unix(int64(time.Now().Unix()), 0),
		}

		measurementActions.CreateMeasurementStruct(db, d)

		fmt.Printf("MID: %s\n", d.MeasurementID)
		fmt.Printf("Device ID: %s\n", d.DeviceID)
		fmt.Printf("Measurement: %f\n", d.MeasurementValue)
		fmt.Printf("Timestamp: %s\n", d.Timestamp)

		// Reset the device's hourly measurement in deviceData
		deviceData[device] = DeviceConsumption{
			HourlyMeasurement: 0,
			MaxHC:             deviceData[device].MaxHC,
		}

		fmt.Println("Data saved for device", device)
	}
}

func processReading(reading Reading, deviceData map[string]DeviceConsumption) map[string]DeviceConsumption {
	device, ok := deviceData[reading.DeviceID]
	if ok {
		device.HourlyMeasurement += reading.MeasurementValue
		deviceData[reading.DeviceID] = device
	} else {
		deviceData[reading.DeviceID] = DeviceConsumption{
			HourlyMeasurement: reading.MeasurementValue,
			MaxHC:             10,
		}
	}

	return deviceData
}

func checkMaxHC(reading Reading, deviceData map[string]DeviceConsumption) {
	if deviceData[reading.DeviceID].MaxHC < deviceData[reading.DeviceID].HourlyMeasurement {
		// Uncomment the following code to send a message when the max HC is exceeded
		/*
			message := strconv.Itoa(reading.DeviceID)
			err := webconn.WriteMessage(websocket.TextMessage, []byte(message))
			if err != nil {
					log.Println("Failed to send message:", err)
					return
			}
		*/
	} else {
		fmt.Println(deviceData[reading.DeviceID].HourlyMeasurement)
	}
}

func GetDeviceMeasurementsByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var date = c.Query("date")

	var devices []Measurement
	fmt.Println(date)
	result := db.Table("device_readings").
		Where("deviceID = ?", id).
		Where("DATE(timestamp) = ?", date).
		Find(&devices)
	if result.Error != nil {
		c.IndentedJSON(http.StatusNotFound, gin.H{"message": "device not found"})
		return
	}
	c.IndentedJSON(http.StatusOK, devices)
}

func main() {
	// Connect to the PostgreSQL database
	var dbString string = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", os.Getenv("PG_HOST"), os.Getenv("PG_PORT"), os.Getenv("PG_USER"), os.Getenv("PG_PASSWORD"), os.Getenv("PG_DBNAME"))

	var rabbitMQString string = fmt.Sprintf("amqp://%s:%s@%s:%s/", os.Getenv("RABBITMQ_USER"), os.Getenv("RABBITMQ_PASSWORD"), os.Getenv("RABBITMQ_HOST"), os.Getenv("RABBITMQ_PORT"))

	fmt.Printf("%s\n", rabbitMQString)

	deliveries, rabbitError, connectionMQ, channelMQ := rabbitMQ(rabbitMQString)
	if rabbitError != nil {
		log.Print(rabbitError.Error())
	}

	messages := make(chan []byte)
	deviceData := make(map[string]DeviceConsumption)

	go func() {
		for delivery := range deliveries {
			messages <- delivery.Body
		}
	}()

	go func() {
		for {
			// if getCurrentMinute() == 0 {
			processDeviceData(deviceData, db)
			time.Sleep(5 * time.Second)
			// time.Sleep(59 * time.Minute)
			// } else {
			// time.Sleep(time.Minute)
			// }
		}
	}()

	go func() {
		for message := range messages {
			var reading Reading
			json.Unmarshal(message, &reading)

			deviceData = processReading(reading, deviceData)
			checkMaxHC(reading, deviceData)

			if err != nil {
				log.Printf("Failed to write reading: %v", err)
			}
		}
	}()

	db, err = gorm.Open("postgres", dbString)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Automigrate the tables
	db.AutoMigrate(&Measurement{})

	// Initialize the Gin router
	r := gin.Default()
	config := cors.DefaultConfig()
	// config.AllowAllOrigins = true
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Authorization", "Content-Type"}
	r.Use(cors.New(config))

	// Define routes
	r.GET("/measurements", measurementActions.GetMeasurements(db))
	r.GET("/measurements/:mid", measurementActions.GetMeasurement(db))
	r.GET("/measurements_ftd/:mid", GetDeviceMeasurementsByID)
	r.POST("/measurements", measurementActions.CreateMeasurement(db))
	r.PUT("/measurements/:mid", measurementActions.UpdateMeasurement(db))
	r.DELETE("/measurements/:mid", measurementActions.DeleteMeasurement(db))

	// Run the server
	err := r.Run("0.0.0.0:8082")
	if err != nil {
		log.Fatal(err)
	}

	defer connectionMQ.Close()
	defer channelMQ.Close()

	<-make(chan struct{})
}
