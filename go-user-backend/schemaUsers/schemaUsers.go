package schemaUsers

type User struct {
	UserID    string `gorm:"column:user_id;type:varchar(40);primary_key;unique"`
	FirstName string `gorm:"column:first_name;type:varchar(50)"`
	LastName  string `gorm:"column:last_name;type:varchar(50)"`
	Username  string `gorm:"column:username;type:varchar(50);unique"`
	Email     string `gorm:"column:email;type:varchar(50);unique"`
	Password  string `gorm:"column:password;type:varchar(40);not null"`
	Roles     string `gorm:"column:roles;type:varchar(200)"`
}

// type Message struct {
// 	MID     string `json:"mid" gorm:"primaryKey; column:mid"`
// 	Message string `json:"message"`
// 	UID     string `json:"uid" gorm:"index;not null; column:uid"`
// }

type Response struct {
	Status     int         `json:"status"`
	TextStatus string      `json:"textStatus"`
	Data       interface{} `json:"data,omitempty"`
}

type UserResponse struct {
	UserID    string `json:"UserID"`
	FirstName string `json:"FirstName"`
	LastName  string `json:"LastName"`
	Username  string `json:"Username"`
	Email     string `json:"Email"`
	Roles     string `json:"Roles"`
}
