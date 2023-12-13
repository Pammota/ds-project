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
	"schemaUsers"
	"userActions"
)

type User = schemaUsers.User
type Response = schemaUsers.Response

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
	db.AutoMigrate(&User{})

	// Initialize the Gin router
	r := gin.Default()
	config := cors.DefaultConfig()
	// config.AllowAllOrigins = true
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Authorization", "Content-Type"}
	r.Use(cors.New(config))

	// Define routes
	r.GET("/users", userActions.GetUsers(db))
	r.GET("/users/:uid", userActions.GetUser(db))
	r.POST("/users", userActions.CreateUser(db))
	r.PUT("/users/:uid", userActions.UpdateUser(db))
	r.DELETE("/users/:uid", userActions.DeleteUser(db))

	r.POST("/login", userActions.Login(db))

	// Run the server
	err := r.Run("0.0.0.0:8080")
	if err != nil {
		log.Fatal(err)
	}
}
