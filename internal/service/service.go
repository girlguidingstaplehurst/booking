package service

import (
	"context"

	"github.com/gofiber/fiber/v2"
)

type Service struct {
}

func NewService() *Service {
	return &Service{}
}

func (s *Service) Run(ctx context.Context) error {
	app := fiber.New()

	app.Static("/", "./static")
	//TODO wire in handlers here

	return app.Listen(":8080")
}
