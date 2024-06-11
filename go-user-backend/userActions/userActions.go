package userActions

import (
	// standard libs
	"net/http"
	"strings"

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
type ValidToken = schemaUsers.ValidToken

func CreateValidToken(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		var validToken ValidToken
		c.BindJSON(&validToken)

		validToken.Token = uuid.New().String()

		err := db.Create(&validToken).Error
		if err != nil {
			response := &Response{Status: http.StatusBadRequest, TextStatus: err.Error()}
			c.AbortWithStatusJSON(http.StatusBadRequest, response)
			return
		} else {
			response := &Response{Status: http.StatusCreated, TextStatus: "ValidToken created successfully"}
			c.JSON(http.StatusCreated, response)
		}
	}
}

func GetValidTokens(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		var validTokens []ValidToken

		db.Find(&validTokens)
		c.JSON(http.StatusOK, validTokens)
	}
}

func DeleteValidToken(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		var validToken ValidToken
		token := c.Param("token")

		db.Where("token = ?", token).First(&validToken)
		if validToken.Token == "" {
			response := &Response{Status: http.StatusNotFound, TextStatus: "No valid token found"}
			c.JSON(http.StatusNotFound, response)
			return
		}

		db.Delete(&validToken)
		response := &Response{Status: http.StatusOK, TextStatus: "ValidToken deleted successfully"}
		c.JSON(http.StatusOK, response)
	}
}

func CheckTokenValidity(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		token := c.Param("token")
		var validToken ValidToken
		db.Where("token = ?", token).First(&validToken)
		if validToken.Token == "" {
			response := map[string]bool{"isTokenValid": false}
			c.JSON(http.StatusOK, response)
			return
		}

		response := map[string]bool{"isTokenValid": true}
		c.JSON(http.StatusOK, response)
	}
}

func GetUsers(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		token := strings.TrimPrefix(authHeader, "Bearer ")
		var validToken ValidToken
		db.Where("token = ?", token).First(&validToken)
		if validToken.Token == "" {
			response := &Response{Status: http.StatusUnauthorized, TextStatus: "Invalid token"}
			c.JSON(http.StatusUnauthorized, response)
			return
		}

		var users []User
		db.Find(&users)
		c.JSON(http.StatusOK, users)
	}
}

func CreateUser(db *gorm.DB) func(c *gin.Context) {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		token := strings.TrimPrefix(authHeader, "Bearer ")
		var validToken ValidToken
		db.Where("token = ?", token).First(&validToken)
		if validToken.Token == "" {
			response := &Response{Status: http.StatusUnauthorized, TextStatus: "Invalid token"}
			c.JSON(http.StatusUnauthorized, response)
			return
		}

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
		authHeader := c.GetHeader("Authorization")
		token := strings.TrimPrefix(authHeader, "Bearer ")
		var validToken ValidToken
		db.Where("token = ?", token).First(&validToken)
		if validToken.Token == "" {
			response := &Response{Status: http.StatusUnauthorized, TextStatus: "Invalid token"}
			c.JSON(http.StatusUnauthorized, response)
			return
		}

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
		authHeader := c.GetHeader("Authorization")
		token := strings.TrimPrefix(authHeader, "Bearer ")
		var validToken ValidToken
		db.Where("token = ?", token).First(&validToken)
		if validToken.Token == "" {
			response := &Response{Status: http.StatusUnauthorized, TextStatus: "Invalid token"}
			c.JSON(http.StatusUnauthorized, response)
			return
		}

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
		authHeader := c.GetHeader("Authorization")
		token := strings.TrimPrefix(authHeader, "Bearer ")
		var validToken ValidToken
		db.Where("token = ?", token).First(&validToken)
		if validToken.Token == "" {
			response := &Response{Status: http.StatusUnauthorized, TextStatus: "Invalid token"}
			c.JSON(http.StatusUnauthorized, response)
			return
		}

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

			validToken := ValidToken{Token: token}
			err = db.Create(&validToken).Error
			if err != nil {
				response := &Response{Status: http.StatusInternalServerError, TextStatus: "Error storing token"}
				c.AbortWithStatusJSON(http.StatusInternalServerError, response)
				return
			}

			response := &Response{Status: http.StatusOK, TextStatus: "Login successful", Data: struct {
				Token string `json:"token"`
				User  User   `json:"user"`
			}{Token: token, User: dbUser}}
			c.JSON(http.StatusOK, response)
		}
	}
}
