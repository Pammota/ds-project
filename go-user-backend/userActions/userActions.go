package userActions

import (
	// standard libs
	"net/http"

	// external libs
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm"

	// "golang.org/x/crypto/bcrypt"

	//internal libs
	"schemaUsers"
)

type User = schemaUsers.User
type UserResponse = schemaUsers.UserResponse
type Response = schemaUsers.Response

func GetUsers(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		var users []User

		db.Find(&users)
		c.JSON(http.StatusOK, users)
	}
}

func CreateUser(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		var user User
		c.BindJSON(&user)

		user.UserID = uuid.New().String()

		err := db.Create(&user).Error
		if err != nil {
			response := &Response{Status: http.StatusBadRequest, TextStatus: err.Error()}
			c.AbortWithStatusJSON(http.StatusBadRequest, response)
			return
		} else {
			response := &Response{Status: http.StatusCreated, TextStatus: "User created successfully"}
			c.JSON(http.StatusCreated, response)
		}
	}
}

func UpdateUser(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		var user User
		c.BindJSON(&user)

		UserID := c.Params.ByName("uid")
		user.UserID = UserID

		err := db.Model(&User{}).Where("user_id = ?", UserID).Updates(user).Error
		if err != nil {
			response := &Response{Status: http.StatusBadRequest, TextStatus: err.Error()}
			c.AbortWithStatusJSON(http.StatusBadRequest, response)
			return
		} else {
			response := &Response{Status: http.StatusOK, TextStatus: "User updated successfully"}
			c.JSON(http.StatusOK, response)
		}
	}
}

func GetUser(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		UserID := c.Params.ByName("uid")
		var user User
		err := db.Where("user_id = ?", UserID).First(&user).Error
		if err != nil {
			c.AbortWithStatus(http.StatusNotFound)
			return
		} else {
			c.JSON(http.StatusOK, user)
			return
		}
	}
}

func DeleteUser(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		UserID := c.Params.ByName("uid")

		err := db.Where("user_id = ?", UserID).Delete(&User{}).Error
		if err != nil {
			response := &Response{Status: http.StatusBadRequest, TextStatus: err.Error()}
			c.AbortWithStatusJSON(http.StatusBadRequest, response)
			return
		} else {
			response := &Response{Status: http.StatusOK, TextStatus: "User deleted successfully"}
			c.JSON(http.StatusOK, response)
		}
	}
}

// func Login(db *gorm.DB) func(c *gin.Context) {
// 	return func(c *gin.Context) {
// 		var user struct {
// 			Username string `json:"username"`
// 			Password string `json:"password"`
// 		}
// 		if err := c.BindJSON(&user); err != nil {
// 			response := &Response{Status: http.StatusBadRequest, TextStatus: "Invalid request body"}
// 			c.AbortWithStatusJSON(http.StatusBadRequest, response)
// 			return
// 		}

// 		var dbUser User
// 		err := db.Where("username = ?", user.Username).First(&dbUser).Error
// 		if err != nil {
// 			response := &Response{Status: http.StatusBadRequest, TextStatus: "Invalid username or password"}
// 			c.AbortWithStatusJSON(http.StatusBadRequest, response)
// 			return
// 		}

// 		// Compare the provided password with the hashed password in the database
// 		err = bcrypt.CompareHashAndPassword([]byte(dbUser.Password), []byte(user.Password))
// 		if err != nil {
// 			response := &Response{Status: http.StatusBadRequest, TextStatus: "Invalid username or password"}
// 			c.AbortWithStatusJSON(http.StatusBadRequest, response)
// 			return
// 		}

// 		// Create a UserResponse struct and copy the fields from the User struct
// 		userResponse := UserResponse{
// 			UserID:    dbUser.UserID,
// 			FirstName: dbUser.FirstName,
// 			LastName:  dbUser.LastName,
// 			Username:  dbUser.Username,
// 			Email:     dbUser.Email,
// 			Roles:     dbUser.Roles,
// 		}

// 		token := uuid.New().String()
// 		response := &Response{Status: http.StatusOK, TextStatus: "Login successful", Data: struct {
// 			Token string       `json:"token"`
// 			User  UserResponse `json:"user"`
// 		}{Token: token, User: userResponse}}
// 		c.JSON(http.StatusOK, response)
// 	}
// }

// func Register(db *gorm.DB) func(c *gin.Context) {
// 	return func(c *gin.Context) {
// 		var user User
// 		if err := c.BindJSON(&user); err != nil {
// 			response := &Response{Status: http.StatusBadRequest, TextStatus: "Invalid request body"}
// 			c.AbortWithStatusJSON(http.StatusBadRequest, response)
// 			return
// 		}

// 		// Generate a new UUID for user_id
// 		user.UserID = uuid.New().String()

// 		// Hash the password before storing it in the database
// 		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
// 		if err != nil {
// 			response := &Response{Status: http.StatusInternalServerError, TextStatus: "Error hashing password"}
// 			c.AbortWithStatusJSON(http.StatusInternalServerError, response)
// 			return
// 		}
// 		user.Password = string(hashedPassword)

// 		err = db.Create(&user).Error
// 		if err != nil {
// 			response := &Response{Status: http.StatusBadRequest, TextStatus: err.Error()}
// 			c.AbortWithStatusJSON(http.StatusBadRequest, response)
// 			return
// 		}

// 		// Create a UserResponse struct and copy the fields from the User struct
// 		userResponse := UserResponse{
// 			UserID:    user.UserID,
// 			FirstName: user.FirstName,
// 			LastName:  user.LastName,
// 			Username:  user.Username,
// 			Email:     user.Email,
// 			Roles:     user.Roles,
// 		}

// 		response := &Response{Status: http.StatusCreated, TextStatus: "Registration successful", Data: userResponse}
// 		c.JSON(http.StatusCreated, response)
// 	}
// }

func Login(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		var user struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		if err := c.BindJSON(&user); err != nil {
			response := &Response{Status: http.StatusBadRequest, TextStatus: "Invalid request body"}
			c.AbortWithStatusJSON(http.StatusBadRequest, response)
			return
		}

		var dbUser User
		err := db.Where("username = ? AND password = ?", user.Username, user.Password).First(&dbUser).Error
		if err != nil {
			response := &Response{Status: http.StatusBadRequest, TextStatus: "Invalid username or password"}
			c.AbortWithStatusJSON(http.StatusBadRequest, response)
			return
		} else {
			token := uuid.New().String()
			response := &Response{Status: http.StatusOK, TextStatus: "Login successful", Data: struct {
				Token string `json:"token"`
				User  User   `json:"user"`
			}{Token: token, User: dbUser}}
			c.JSON(http.StatusOK, response)
		}
	}
}
