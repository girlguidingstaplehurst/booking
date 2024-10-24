// Package rest provides primitives to interact with the openapi HTTP API.
//
// Code generated by github.com/oapi-codegen/oapi-codegen/v2 version v2.4.0 DO NOT EDIT.
package rest

import (
	"bytes"
	"compress/gzip"
	"context"
	"encoding/base64"
	"fmt"
	"net/url"
	"path"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/gofiber/fiber/v2"
	"github.com/oapi-codegen/runtime"
)

// ServerInterface represents all server handlers.
type ServerInterface interface {
	// Add an event
	// (POST /api/v1/add-event)
	AddEvent(c *fiber.Ctx) error

	// (GET /api/v1/admin/events)
	GetApiV1AdminEvents(c *fiber.Ctx, params GetApiV1AdminEventsParams) error

	// (GET /api/v1/admin/events/{eventID})
	GetApiV1AdminEventsEventID(c *fiber.Ctx, eventID string) error

	// (POST /api/v1/admin/events/{eventID}/set-rate)
	AdminEventSetRate(c *fiber.Ctx, eventID string) error

	// (GET /api/v1/admin/invoices/by-id/{invoiceID})
	AdminGetInvoiceByID(c *fiber.Ctx, invoiceID string) error

	// (POST /api/v1/admin/invoices/by-id/{invoiceID}/mark-as-paid)
	AdminMarkInvoicePaid(c *fiber.Ctx, invoiceID string) error

	// (GET /api/v1/admin/invoices/for-events)
	AdminGetInvoicesForEvents(c *fiber.Ctx, params AdminGetInvoicesForEventsParams) error

	// (GET /api/v1/admin/rates)
	AdminGetRates(c *fiber.Ctx) error

	// (POST /api/v1/admin/send-invoice)
	AdminSendInvoice(c *fiber.Ctx) error

	// (GET /api/v1/events)
	GetApiV1Events(c *fiber.Ctx, params GetApiV1EventsParams) error
}

// ServerInterfaceWrapper converts contexts to parameters.
type ServerInterfaceWrapper struct {
	Handler ServerInterface
}

type MiddlewareFunc fiber.Handler

// AddEvent operation middleware
func (siw *ServerInterfaceWrapper) AddEvent(c *fiber.Ctx) error {

	return siw.Handler.AddEvent(c)
}

// GetApiV1AdminEvents operation middleware
func (siw *ServerInterfaceWrapper) GetApiV1AdminEvents(c *fiber.Ctx) error {

	var err error

	c.Context().SetUserValue(Admin_authScopes, []string{})

	// Parameter object where we will unmarshal all parameters from the context
	var params GetApiV1AdminEventsParams

	var query url.Values
	query, err = url.ParseQuery(string(c.Request().URI().QueryString()))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, fmt.Errorf("Invalid format for query string: %w", err).Error())
	}

	// ------------- Optional query parameter "from" -------------

	err = runtime.BindQueryParameter("form", true, false, "from", query, &params.From)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, fmt.Errorf("Invalid format for parameter from: %w", err).Error())
	}

	// ------------- Optional query parameter "to" -------------

	err = runtime.BindQueryParameter("form", true, false, "to", query, &params.To)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, fmt.Errorf("Invalid format for parameter to: %w", err).Error())
	}

	return siw.Handler.GetApiV1AdminEvents(c, params)
}

// GetApiV1AdminEventsEventID operation middleware
func (siw *ServerInterfaceWrapper) GetApiV1AdminEventsEventID(c *fiber.Ctx) error {

	var err error

	// ------------- Path parameter "eventID" -------------
	var eventID string

	err = runtime.BindStyledParameterWithOptions("simple", "eventID", c.Params("eventID"), &eventID, runtime.BindStyledParameterOptions{Explode: false, Required: false})
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, fmt.Errorf("Invalid format for parameter eventID: %w", err).Error())
	}

	c.Context().SetUserValue(Admin_authScopes, []string{})

	return siw.Handler.GetApiV1AdminEventsEventID(c, eventID)
}

// AdminEventSetRate operation middleware
func (siw *ServerInterfaceWrapper) AdminEventSetRate(c *fiber.Ctx) error {

	var err error

	// ------------- Path parameter "eventID" -------------
	var eventID string

	err = runtime.BindStyledParameterWithOptions("simple", "eventID", c.Params("eventID"), &eventID, runtime.BindStyledParameterOptions{Explode: false, Required: false})
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, fmt.Errorf("Invalid format for parameter eventID: %w", err).Error())
	}

	c.Context().SetUserValue(Admin_authScopes, []string{})

	return siw.Handler.AdminEventSetRate(c, eventID)
}

// AdminGetInvoiceByID operation middleware
func (siw *ServerInterfaceWrapper) AdminGetInvoiceByID(c *fiber.Ctx) error {

	var err error

	// ------------- Path parameter "invoiceID" -------------
	var invoiceID string

	err = runtime.BindStyledParameterWithOptions("simple", "invoiceID", c.Params("invoiceID"), &invoiceID, runtime.BindStyledParameterOptions{Explode: false, Required: false})
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, fmt.Errorf("Invalid format for parameter invoiceID: %w", err).Error())
	}

	c.Context().SetUserValue(Admin_authScopes, []string{})

	return siw.Handler.AdminGetInvoiceByID(c, invoiceID)
}

// AdminMarkInvoicePaid operation middleware
func (siw *ServerInterfaceWrapper) AdminMarkInvoicePaid(c *fiber.Ctx) error {

	var err error

	// ------------- Path parameter "invoiceID" -------------
	var invoiceID string

	err = runtime.BindStyledParameterWithOptions("simple", "invoiceID", c.Params("invoiceID"), &invoiceID, runtime.BindStyledParameterOptions{Explode: false, Required: false})
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, fmt.Errorf("Invalid format for parameter invoiceID: %w", err).Error())
	}

	c.Context().SetUserValue(Admin_authScopes, []string{})

	return siw.Handler.AdminMarkInvoicePaid(c, invoiceID)
}

// AdminGetInvoicesForEvents operation middleware
func (siw *ServerInterfaceWrapper) AdminGetInvoicesForEvents(c *fiber.Ctx) error {

	var err error

	c.Context().SetUserValue(Admin_authScopes, []string{})

	// Parameter object where we will unmarshal all parameters from the context
	var params AdminGetInvoicesForEventsParams

	var query url.Values
	query, err = url.ParseQuery(string(c.Request().URI().QueryString()))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, fmt.Errorf("Invalid format for query string: %w", err).Error())
	}

	// ------------- Required query parameter "events" -------------

	if paramValue := c.Query("events"); paramValue != "" {

	} else {
		err = fmt.Errorf("Query argument events is required, but not found")
		c.Status(fiber.StatusBadRequest).JSON(err)
		return err
	}

	err = runtime.BindQueryParameter("form", true, true, "events", query, &params.Events)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, fmt.Errorf("Invalid format for parameter events: %w", err).Error())
	}

	return siw.Handler.AdminGetInvoicesForEvents(c, params)
}

// AdminGetRates operation middleware
func (siw *ServerInterfaceWrapper) AdminGetRates(c *fiber.Ctx) error {

	c.Context().SetUserValue(Admin_authScopes, []string{})

	return siw.Handler.AdminGetRates(c)
}

// AdminSendInvoice operation middleware
func (siw *ServerInterfaceWrapper) AdminSendInvoice(c *fiber.Ctx) error {

	c.Context().SetUserValue(Admin_authScopes, []string{})

	return siw.Handler.AdminSendInvoice(c)
}

// GetApiV1Events operation middleware
func (siw *ServerInterfaceWrapper) GetApiV1Events(c *fiber.Ctx) error {

	var err error

	// Parameter object where we will unmarshal all parameters from the context
	var params GetApiV1EventsParams

	var query url.Values
	query, err = url.ParseQuery(string(c.Request().URI().QueryString()))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, fmt.Errorf("Invalid format for query string: %w", err).Error())
	}

	// ------------- Optional query parameter "from" -------------

	err = runtime.BindQueryParameter("form", true, false, "from", query, &params.From)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, fmt.Errorf("Invalid format for parameter from: %w", err).Error())
	}

	// ------------- Optional query parameter "to" -------------

	err = runtime.BindQueryParameter("form", true, false, "to", query, &params.To)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, fmt.Errorf("Invalid format for parameter to: %w", err).Error())
	}

	return siw.Handler.GetApiV1Events(c, params)
}

// FiberServerOptions provides options for the Fiber server.
type FiberServerOptions struct {
	BaseURL     string
	Middlewares []MiddlewareFunc
}

// RegisterHandlers creates http.Handler with routing matching OpenAPI spec.
func RegisterHandlers(router fiber.Router, si ServerInterface) {
	RegisterHandlersWithOptions(router, si, FiberServerOptions{})
}

// RegisterHandlersWithOptions creates http.Handler with additional options
func RegisterHandlersWithOptions(router fiber.Router, si ServerInterface, options FiberServerOptions) {
	wrapper := ServerInterfaceWrapper{
		Handler: si,
	}

	for _, m := range options.Middlewares {
		router.Use(fiber.Handler(m))
	}

	router.Post(options.BaseURL+"/api/v1/add-event", wrapper.AddEvent)

	router.Get(options.BaseURL+"/api/v1/admin/events", wrapper.GetApiV1AdminEvents)

	router.Get(options.BaseURL+"/api/v1/admin/events/:eventID", wrapper.GetApiV1AdminEventsEventID)

	router.Post(options.BaseURL+"/api/v1/admin/events/:eventID/set-rate", wrapper.AdminEventSetRate)

	router.Get(options.BaseURL+"/api/v1/admin/invoices/by-id/:invoiceID", wrapper.AdminGetInvoiceByID)

	router.Post(options.BaseURL+"/api/v1/admin/invoices/by-id/:invoiceID/mark-as-paid", wrapper.AdminMarkInvoicePaid)

	router.Get(options.BaseURL+"/api/v1/admin/invoices/for-events", wrapper.AdminGetInvoicesForEvents)

	router.Get(options.BaseURL+"/api/v1/admin/rates", wrapper.AdminGetRates)

	router.Post(options.BaseURL+"/api/v1/admin/send-invoice", wrapper.AdminSendInvoice)

	router.Get(options.BaseURL+"/api/v1/events", wrapper.GetApiV1Events)

}

type AddEventRequestObject struct {
	Body *AddEventJSONRequestBody
}

type AddEventResponseObject interface {
	VisitAddEventResponse(ctx *fiber.Ctx) error
}

type AddEvent200Response struct {
}

func (response AddEvent200Response) VisitAddEventResponse(ctx *fiber.Ctx) error {
	ctx.Status(200)
	return nil
}

type AddEvent409JSONResponse ErrorResponse

func (response AddEvent409JSONResponse) VisitAddEventResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(409)

	return ctx.JSON(&response)
}

type AddEvent422JSONResponse ErrorResponse

func (response AddEvent422JSONResponse) VisitAddEventResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(422)

	return ctx.JSON(&response)
}

type AddEvent500JSONResponse ErrorResponse

func (response AddEvent500JSONResponse) VisitAddEventResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(500)

	return ctx.JSON(&response)
}

type GetApiV1AdminEventsRequestObject struct {
	Params GetApiV1AdminEventsParams
}

type GetApiV1AdminEventsResponseObject interface {
	VisitGetApiV1AdminEventsResponse(ctx *fiber.Ctx) error
}

type GetApiV1AdminEvents200JSONResponse AdminEventList

func (response GetApiV1AdminEvents200JSONResponse) VisitGetApiV1AdminEventsResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(200)

	return ctx.JSON(&response)
}

type GetApiV1AdminEvents400JSONResponse ErrorResponse

func (response GetApiV1AdminEvents400JSONResponse) VisitGetApiV1AdminEventsResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(400)

	return ctx.JSON(&response)
}

type GetApiV1AdminEvents500JSONResponse ErrorResponse

func (response GetApiV1AdminEvents500JSONResponse) VisitGetApiV1AdminEventsResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(500)

	return ctx.JSON(&response)
}

type GetApiV1AdminEventsEventIDRequestObject struct {
	EventID string `json:"eventID,omitempty"`
}

type GetApiV1AdminEventsEventIDResponseObject interface {
	VisitGetApiV1AdminEventsEventIDResponse(ctx *fiber.Ctx) error
}

type GetApiV1AdminEventsEventID200JSONResponse Event

func (response GetApiV1AdminEventsEventID200JSONResponse) VisitGetApiV1AdminEventsEventIDResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(200)

	return ctx.JSON(&response)
}

type GetApiV1AdminEventsEventID404JSONResponse ErrorResponse

func (response GetApiV1AdminEventsEventID404JSONResponse) VisitGetApiV1AdminEventsEventIDResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(404)

	return ctx.JSON(&response)
}

type GetApiV1AdminEventsEventID500JSONResponse ErrorResponse

func (response GetApiV1AdminEventsEventID500JSONResponse) VisitGetApiV1AdminEventsEventIDResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(500)

	return ctx.JSON(&response)
}

type AdminEventSetRateRequestObject struct {
	EventID string `json:"eventID,omitempty"`
	Body    *AdminEventSetRateJSONRequestBody
}

type AdminEventSetRateResponseObject interface {
	VisitAdminEventSetRateResponse(ctx *fiber.Ctx) error
}

type AdminEventSetRate200Response struct {
}

func (response AdminEventSetRate200Response) VisitAdminEventSetRateResponse(ctx *fiber.Ctx) error {
	ctx.Status(200)
	return nil
}

type AdminEventSetRate404JSONResponse ErrorResponse

func (response AdminEventSetRate404JSONResponse) VisitAdminEventSetRateResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(404)

	return ctx.JSON(&response)
}

type AdminEventSetRate500JSONResponse ErrorResponse

func (response AdminEventSetRate500JSONResponse) VisitAdminEventSetRateResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(500)

	return ctx.JSON(&response)
}

type AdminGetInvoiceByIDRequestObject struct {
	InvoiceID string `json:"invoiceID,omitempty"`
}

type AdminGetInvoiceByIDResponseObject interface {
	VisitAdminGetInvoiceByIDResponse(ctx *fiber.Ctx) error
}

type AdminGetInvoiceByID200JSONResponse Invoice

func (response AdminGetInvoiceByID200JSONResponse) VisitAdminGetInvoiceByIDResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(200)

	return ctx.JSON(&response)
}

type AdminGetInvoiceByID404JSONResponse ErrorResponse

func (response AdminGetInvoiceByID404JSONResponse) VisitAdminGetInvoiceByIDResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(404)

	return ctx.JSON(&response)
}

type AdminGetInvoiceByID500JSONResponse ErrorResponse

func (response AdminGetInvoiceByID500JSONResponse) VisitAdminGetInvoiceByIDResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(500)

	return ctx.JSON(&response)
}

type AdminMarkInvoicePaidRequestObject struct {
	InvoiceID string `json:"invoiceID,omitempty"`
}

type AdminMarkInvoicePaidResponseObject interface {
	VisitAdminMarkInvoicePaidResponse(ctx *fiber.Ctx) error
}

type AdminMarkInvoicePaid200Response struct {
}

func (response AdminMarkInvoicePaid200Response) VisitAdminMarkInvoicePaidResponse(ctx *fiber.Ctx) error {
	ctx.Status(200)
	return nil
}

type AdminMarkInvoicePaid404JSONResponse ErrorResponse

func (response AdminMarkInvoicePaid404JSONResponse) VisitAdminMarkInvoicePaidResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(404)

	return ctx.JSON(&response)
}

type AdminMarkInvoicePaid500JSONResponse ErrorResponse

func (response AdminMarkInvoicePaid500JSONResponse) VisitAdminMarkInvoicePaidResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(500)

	return ctx.JSON(&response)
}

type AdminGetInvoicesForEventsRequestObject struct {
	Params AdminGetInvoicesForEventsParams
}

type AdminGetInvoicesForEventsResponseObject interface {
	VisitAdminGetInvoicesForEventsResponse(ctx *fiber.Ctx) error
}

type AdminGetInvoicesForEvents200JSONResponse InvoiceEvents

func (response AdminGetInvoicesForEvents200JSONResponse) VisitAdminGetInvoicesForEventsResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(200)

	return ctx.JSON(&response)
}

type AdminGetInvoicesForEvents404JSONResponse ErrorResponse

func (response AdminGetInvoicesForEvents404JSONResponse) VisitAdminGetInvoicesForEventsResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(404)

	return ctx.JSON(&response)
}

type AdminGetInvoicesForEvents500JSONResponse ErrorResponse

func (response AdminGetInvoicesForEvents500JSONResponse) VisitAdminGetInvoicesForEventsResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(500)

	return ctx.JSON(&response)
}

type AdminGetRatesRequestObject struct {
}

type AdminGetRatesResponseObject interface {
	VisitAdminGetRatesResponse(ctx *fiber.Ctx) error
}

type AdminGetRates200JSONResponse RatesList

func (response AdminGetRates200JSONResponse) VisitAdminGetRatesResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(200)

	return ctx.JSON(&response)
}

type AdminGetRates500JSONResponse ErrorResponse

func (response AdminGetRates500JSONResponse) VisitAdminGetRatesResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(500)

	return ctx.JSON(&response)
}

type AdminSendInvoiceRequestObject struct {
	Body *AdminSendInvoiceJSONRequestBody
}

type AdminSendInvoiceResponseObject interface {
	VisitAdminSendInvoiceResponse(ctx *fiber.Ctx) error
}

type AdminSendInvoice200Response struct {
}

func (response AdminSendInvoice200Response) VisitAdminSendInvoiceResponse(ctx *fiber.Ctx) error {
	ctx.Status(200)
	return nil
}

type AdminSendInvoice404JSONResponse ErrorResponse

func (response AdminSendInvoice404JSONResponse) VisitAdminSendInvoiceResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(404)

	return ctx.JSON(&response)
}

type AdminSendInvoice500JSONResponse ErrorResponse

func (response AdminSendInvoice500JSONResponse) VisitAdminSendInvoiceResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(500)

	return ctx.JSON(&response)
}

type GetApiV1EventsRequestObject struct {
	Params GetApiV1EventsParams
}

type GetApiV1EventsResponseObject interface {
	VisitGetApiV1EventsResponse(ctx *fiber.Ctx) error
}

type GetApiV1Events200JSONResponse EventList

func (response GetApiV1Events200JSONResponse) VisitGetApiV1EventsResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(200)

	return ctx.JSON(&response)
}

type GetApiV1Events400JSONResponse ErrorResponse

func (response GetApiV1Events400JSONResponse) VisitGetApiV1EventsResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(400)

	return ctx.JSON(&response)
}

type GetApiV1Events500JSONResponse ErrorResponse

func (response GetApiV1Events500JSONResponse) VisitGetApiV1EventsResponse(ctx *fiber.Ctx) error {
	ctx.Response().Header.Set("Content-Type", "application/json")
	ctx.Status(500)

	return ctx.JSON(&response)
}

// StrictServerInterface represents all server handlers.
type StrictServerInterface interface {
	// Add an event
	// (POST /api/v1/add-event)
	AddEvent(ctx context.Context, request AddEventRequestObject) (AddEventResponseObject, error)

	// (GET /api/v1/admin/events)
	GetApiV1AdminEvents(ctx context.Context, request GetApiV1AdminEventsRequestObject) (GetApiV1AdminEventsResponseObject, error)

	// (GET /api/v1/admin/events/{eventID})
	GetApiV1AdminEventsEventID(ctx context.Context, request GetApiV1AdminEventsEventIDRequestObject) (GetApiV1AdminEventsEventIDResponseObject, error)

	// (POST /api/v1/admin/events/{eventID}/set-rate)
	AdminEventSetRate(ctx context.Context, request AdminEventSetRateRequestObject) (AdminEventSetRateResponseObject, error)

	// (GET /api/v1/admin/invoices/by-id/{invoiceID})
	AdminGetInvoiceByID(ctx context.Context, request AdminGetInvoiceByIDRequestObject) (AdminGetInvoiceByIDResponseObject, error)

	// (POST /api/v1/admin/invoices/by-id/{invoiceID}/mark-as-paid)
	AdminMarkInvoicePaid(ctx context.Context, request AdminMarkInvoicePaidRequestObject) (AdminMarkInvoicePaidResponseObject, error)

	// (GET /api/v1/admin/invoices/for-events)
	AdminGetInvoicesForEvents(ctx context.Context, request AdminGetInvoicesForEventsRequestObject) (AdminGetInvoicesForEventsResponseObject, error)

	// (GET /api/v1/admin/rates)
	AdminGetRates(ctx context.Context, request AdminGetRatesRequestObject) (AdminGetRatesResponseObject, error)

	// (POST /api/v1/admin/send-invoice)
	AdminSendInvoice(ctx context.Context, request AdminSendInvoiceRequestObject) (AdminSendInvoiceResponseObject, error)

	// (GET /api/v1/events)
	GetApiV1Events(ctx context.Context, request GetApiV1EventsRequestObject) (GetApiV1EventsResponseObject, error)
}

type StrictHandlerFunc func(ctx *fiber.Ctx, args interface{}) (interface{}, error)

type StrictMiddlewareFunc func(f StrictHandlerFunc, operationID string) StrictHandlerFunc

func NewStrictHandler(ssi StrictServerInterface, middlewares []StrictMiddlewareFunc) ServerInterface {
	return &strictHandler{ssi: ssi, middlewares: middlewares}
}

type strictHandler struct {
	ssi         StrictServerInterface
	middlewares []StrictMiddlewareFunc
}

// AddEvent operation middleware
func (sh *strictHandler) AddEvent(ctx *fiber.Ctx) error {
	var request AddEventRequestObject

	var body AddEventJSONRequestBody
	if err := ctx.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	request.Body = &body

	handler := func(ctx *fiber.Ctx, request interface{}) (interface{}, error) {
		return sh.ssi.AddEvent(ctx.UserContext(), request.(AddEventRequestObject))
	}
	for _, middleware := range sh.middlewares {
		handler = middleware(handler, "AddEvent")
	}

	response, err := handler(ctx, request)

	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	} else if validResponse, ok := response.(AddEventResponseObject); ok {
		if err := validResponse.VisitAddEventResponse(ctx); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, err.Error())
		}
	} else if response != nil {
		return fmt.Errorf("unexpected response type: %T", response)
	}
	return nil
}

// GetApiV1AdminEvents operation middleware
func (sh *strictHandler) GetApiV1AdminEvents(ctx *fiber.Ctx, params GetApiV1AdminEventsParams) error {
	var request GetApiV1AdminEventsRequestObject

	request.Params = params

	handler := func(ctx *fiber.Ctx, request interface{}) (interface{}, error) {
		return sh.ssi.GetApiV1AdminEvents(ctx.UserContext(), request.(GetApiV1AdminEventsRequestObject))
	}
	for _, middleware := range sh.middlewares {
		handler = middleware(handler, "GetApiV1AdminEvents")
	}

	response, err := handler(ctx, request)

	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	} else if validResponse, ok := response.(GetApiV1AdminEventsResponseObject); ok {
		if err := validResponse.VisitGetApiV1AdminEventsResponse(ctx); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, err.Error())
		}
	} else if response != nil {
		return fmt.Errorf("unexpected response type: %T", response)
	}
	return nil
}

// GetApiV1AdminEventsEventID operation middleware
func (sh *strictHandler) GetApiV1AdminEventsEventID(ctx *fiber.Ctx, eventID string) error {
	var request GetApiV1AdminEventsEventIDRequestObject

	request.EventID = eventID

	handler := func(ctx *fiber.Ctx, request interface{}) (interface{}, error) {
		return sh.ssi.GetApiV1AdminEventsEventID(ctx.UserContext(), request.(GetApiV1AdminEventsEventIDRequestObject))
	}
	for _, middleware := range sh.middlewares {
		handler = middleware(handler, "GetApiV1AdminEventsEventID")
	}

	response, err := handler(ctx, request)

	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	} else if validResponse, ok := response.(GetApiV1AdminEventsEventIDResponseObject); ok {
		if err := validResponse.VisitGetApiV1AdminEventsEventIDResponse(ctx); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, err.Error())
		}
	} else if response != nil {
		return fmt.Errorf("unexpected response type: %T", response)
	}
	return nil
}

// AdminEventSetRate operation middleware
func (sh *strictHandler) AdminEventSetRate(ctx *fiber.Ctx, eventID string) error {
	var request AdminEventSetRateRequestObject

	request.EventID = eventID

	var body AdminEventSetRateJSONRequestBody
	if err := ctx.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	request.Body = &body

	handler := func(ctx *fiber.Ctx, request interface{}) (interface{}, error) {
		return sh.ssi.AdminEventSetRate(ctx.UserContext(), request.(AdminEventSetRateRequestObject))
	}
	for _, middleware := range sh.middlewares {
		handler = middleware(handler, "AdminEventSetRate")
	}

	response, err := handler(ctx, request)

	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	} else if validResponse, ok := response.(AdminEventSetRateResponseObject); ok {
		if err := validResponse.VisitAdminEventSetRateResponse(ctx); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, err.Error())
		}
	} else if response != nil {
		return fmt.Errorf("unexpected response type: %T", response)
	}
	return nil
}

// AdminGetInvoiceByID operation middleware
func (sh *strictHandler) AdminGetInvoiceByID(ctx *fiber.Ctx, invoiceID string) error {
	var request AdminGetInvoiceByIDRequestObject

	request.InvoiceID = invoiceID

	handler := func(ctx *fiber.Ctx, request interface{}) (interface{}, error) {
		return sh.ssi.AdminGetInvoiceByID(ctx.UserContext(), request.(AdminGetInvoiceByIDRequestObject))
	}
	for _, middleware := range sh.middlewares {
		handler = middleware(handler, "AdminGetInvoiceByID")
	}

	response, err := handler(ctx, request)

	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	} else if validResponse, ok := response.(AdminGetInvoiceByIDResponseObject); ok {
		if err := validResponse.VisitAdminGetInvoiceByIDResponse(ctx); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, err.Error())
		}
	} else if response != nil {
		return fmt.Errorf("unexpected response type: %T", response)
	}
	return nil
}

// AdminMarkInvoicePaid operation middleware
func (sh *strictHandler) AdminMarkInvoicePaid(ctx *fiber.Ctx, invoiceID string) error {
	var request AdminMarkInvoicePaidRequestObject

	request.InvoiceID = invoiceID

	handler := func(ctx *fiber.Ctx, request interface{}) (interface{}, error) {
		return sh.ssi.AdminMarkInvoicePaid(ctx.UserContext(), request.(AdminMarkInvoicePaidRequestObject))
	}
	for _, middleware := range sh.middlewares {
		handler = middleware(handler, "AdminMarkInvoicePaid")
	}

	response, err := handler(ctx, request)

	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	} else if validResponse, ok := response.(AdminMarkInvoicePaidResponseObject); ok {
		if err := validResponse.VisitAdminMarkInvoicePaidResponse(ctx); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, err.Error())
		}
	} else if response != nil {
		return fmt.Errorf("unexpected response type: %T", response)
	}
	return nil
}

// AdminGetInvoicesForEvents operation middleware
func (sh *strictHandler) AdminGetInvoicesForEvents(ctx *fiber.Ctx, params AdminGetInvoicesForEventsParams) error {
	var request AdminGetInvoicesForEventsRequestObject

	request.Params = params

	handler := func(ctx *fiber.Ctx, request interface{}) (interface{}, error) {
		return sh.ssi.AdminGetInvoicesForEvents(ctx.UserContext(), request.(AdminGetInvoicesForEventsRequestObject))
	}
	for _, middleware := range sh.middlewares {
		handler = middleware(handler, "AdminGetInvoicesForEvents")
	}

	response, err := handler(ctx, request)

	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	} else if validResponse, ok := response.(AdminGetInvoicesForEventsResponseObject); ok {
		if err := validResponse.VisitAdminGetInvoicesForEventsResponse(ctx); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, err.Error())
		}
	} else if response != nil {
		return fmt.Errorf("unexpected response type: %T", response)
	}
	return nil
}

// AdminGetRates operation middleware
func (sh *strictHandler) AdminGetRates(ctx *fiber.Ctx) error {
	var request AdminGetRatesRequestObject

	handler := func(ctx *fiber.Ctx, request interface{}) (interface{}, error) {
		return sh.ssi.AdminGetRates(ctx.UserContext(), request.(AdminGetRatesRequestObject))
	}
	for _, middleware := range sh.middlewares {
		handler = middleware(handler, "AdminGetRates")
	}

	response, err := handler(ctx, request)

	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	} else if validResponse, ok := response.(AdminGetRatesResponseObject); ok {
		if err := validResponse.VisitAdminGetRatesResponse(ctx); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, err.Error())
		}
	} else if response != nil {
		return fmt.Errorf("unexpected response type: %T", response)
	}
	return nil
}

// AdminSendInvoice operation middleware
func (sh *strictHandler) AdminSendInvoice(ctx *fiber.Ctx) error {
	var request AdminSendInvoiceRequestObject

	var body AdminSendInvoiceJSONRequestBody
	if err := ctx.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	request.Body = &body

	handler := func(ctx *fiber.Ctx, request interface{}) (interface{}, error) {
		return sh.ssi.AdminSendInvoice(ctx.UserContext(), request.(AdminSendInvoiceRequestObject))
	}
	for _, middleware := range sh.middlewares {
		handler = middleware(handler, "AdminSendInvoice")
	}

	response, err := handler(ctx, request)

	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	} else if validResponse, ok := response.(AdminSendInvoiceResponseObject); ok {
		if err := validResponse.VisitAdminSendInvoiceResponse(ctx); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, err.Error())
		}
	} else if response != nil {
		return fmt.Errorf("unexpected response type: %T", response)
	}
	return nil
}

// GetApiV1Events operation middleware
func (sh *strictHandler) GetApiV1Events(ctx *fiber.Ctx, params GetApiV1EventsParams) error {
	var request GetApiV1EventsRequestObject

	request.Params = params

	handler := func(ctx *fiber.Ctx, request interface{}) (interface{}, error) {
		return sh.ssi.GetApiV1Events(ctx.UserContext(), request.(GetApiV1EventsRequestObject))
	}
	for _, middleware := range sh.middlewares {
		handler = middleware(handler, "GetApiV1Events")
	}

	response, err := handler(ctx, request)

	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	} else if validResponse, ok := response.(GetApiV1EventsResponseObject); ok {
		if err := validResponse.VisitGetApiV1EventsResponse(ctx); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, err.Error())
		}
	} else if response != nil {
		return fmt.Errorf("unexpected response type: %T", response)
	}
	return nil
}

// Base64 encoded, gzipped, json marshaled Swagger object
var swaggerSpec = []string{

	"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",
	"AA==",
}

// GetSwagger returns the content of the embedded swagger specification file
// or error if failed to decode
func decodeSpec() ([]byte, error) {
	zipped, err := base64.StdEncoding.DecodeString(strings.Join(swaggerSpec, ""))
	if err != nil {
		return nil, fmt.Errorf("error base64 decoding spec: %w", err)
	}
	zr, err := gzip.NewReader(bytes.NewReader(zipped))
	if err != nil {
		return nil, fmt.Errorf("error decompressing spec: %w", err)
	}
	var buf bytes.Buffer
	_, err = buf.ReadFrom(zr)
	if err != nil {
		return nil, fmt.Errorf("error decompressing spec: %w", err)
	}

	return buf.Bytes(), nil
}

var rawSpec = decodeSpecCached()

// a naive cached of a decoded swagger spec
func decodeSpecCached() func() ([]byte, error) {
	data, err := decodeSpec()
	return func() ([]byte, error) {
		return data, err
	}
}

// Constructs a synthetic filesystem for resolving external references when loading openapi specifications.
func PathToRawSpec(pathToFile string) map[string]func() ([]byte, error) {
	res := make(map[string]func() ([]byte, error))
	if len(pathToFile) > 0 {
		res[pathToFile] = rawSpec
	}

	return res
}

// GetSwagger returns the Swagger specification corresponding to the generated code
// in this file. The external references of Swagger specification are resolved.
// The logic of resolving external references is tightly connected to "import-mapping" feature.
// Externally referenced files must be embedded in the corresponding golang packages.
// Urls can be supported but this task was out of the scope.
func GetSwagger() (swagger *openapi3.T, err error) {
	resolvePath := PathToRawSpec("")

	loader := openapi3.NewLoader()
	loader.IsExternalRefsAllowed = true
	loader.ReadFromURIFunc = func(loader *openapi3.Loader, url *url.URL) ([]byte, error) {
		pathToFile := url.String()
		pathToFile = path.Clean(pathToFile)
		getSpec, ok := resolvePath[pathToFile]
		if !ok {
			err1 := fmt.Errorf("path not found: %s", pathToFile)
			return nil, err1
		}
		return getSpec()
	}
	var specData []byte
	specData, err = rawSpec()
	if err != nil {
		return
	}
	swagger, err = loader.LoadFromData(specData)
	if err != nil {
		return
	}
	return
}
