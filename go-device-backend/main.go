package main

import (
	// standard libs
	"fmt"
	"log"
	"os"

	// external libs
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres" // driver for postgres

	// "github.com/joho/godotenv"

	// internal libs
	"deviceActions"
	"schemaDevices"
)

type Device = schemaDevices.Device

// type Message = schema.Message
type Response = schemaDevices.Response

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

func main() {
	// Connect to the PostgreSQL database
	var dbString string = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", os.Getenv("PG_HOST"), os.Getenv("PG_PORT"), os.Getenv("PG_USER"), os.Getenv("PG_PASSWORD"), os.Getenv("PG_DBNAME"))

	db, err = gorm.Open("postgres", dbString)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Automigrate the tables
	db.AutoMigrate(&Device{})

	// Initialize the Gin router
	r := gin.Default()
	config := cors.DefaultConfig()
	// config.AllowAllOrigins = true
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Authorization", "Content-Type"}
	r.Use(cors.New(config))

	// Define routes
	// -- Users
	r.GET("/devices", deviceActions.GetDevices(db))
	r.POST("/devices", deviceActions.CreateDevice(db))
	r.GET("/devices/:did", deviceActions.GetDevice(db))
	r.PUT("/devices/:did", deviceActions.UpdateDevice(db))
	r.DELETE("/devices/:did", deviceActions.DeleteDevice(db))

	// Run the server
	err := r.Run("0.0.0.0:8081")
	if err != nil {
		log.Fatal(err)
	}
}
