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

	"H4sIAAAAAAAC/+xX32/bNhD+Vwhuj6rl/tjD/OYiXuChSII464AVQUCLZ4utRKrkya4R+H8fjqIsy1IW",
	"t3WDYshbYh6/O959393pnicmL4wGjY6P7rlLUsiF/3Msc6UnK9D4TjmkXwprCrCowJ/Dqr6kEHL/x68W",
	"FnzEf4kb0Dggxh6JbyOOmwL4iAtrxYZvtxG38LlUFiQffahBb3dmZv4REn9vYq2x1+AKox30hEPHdzk4",
	"J5b+OAA4tEovu45a5r3+fMAdP8I5tdTgXSyMzQXyEYdcqIxHhz4jnhiNIsGeeKJw6SiYhTV5y1IKBFQ5",
	"9Bkr2evuE2xSk0mwU32c092FyxKPu6FFDr2+HQosqzLpMqf8F9aslFNGC0ISa6FQ6SWTJilzT4GIi4KM",
	"QPKIJ0InkGUg9yrVoKM5Ojfkc57tBzk3JgOhOwRR5Nc/KKTf+9k9pYFqilyX9EE2nURIBPLdYmpAOuGc",
	"gms/OxG+rtZ9CbyA9QP525P8QZ2JHHdCSgvOfZegDsIPkbfx+4KGE1T8wdIW5TxTSba529OYhIUoM+Qj",
	"tCVEHcl9e8V6itXx381Anz729NuXshloOdUroxJ4a+TmP8v9eD0bqUtwiVUFKqP5yMuRmQXzlGLTM8cw",
	"FcgwVY6pyjsTRZEpcAzNgEdNq+iKoNUS9iyP6i4H750i5I/2mab/VS6OyKPH7cml2x+VusznYOl2K1v3",
	"D+R1eva4VLyHNl4vTRwkpVW4mVFawuCnfehOlJjSf3MQFuwfdcX//PuG+oW3Job704YBKWLBtwSs9MJ0",
	"639zeXbJI56pBMJyU8mMn1/8xcaLBVjDzq/esdeDIY94abOA6UZxvF6vB0tdDoxdxgHAxWJZZC9eD4YD",
	"0IMU88zXUCGpkr815hO12NnGIeRsfDWlaQbWVbG8HAwHQ7I3BWhRKD7iBPSaJCYw9bmIRaHi1ctYSPmi",
	"aSqheu2njaVkgmlYM2/I0DBMgSUiAy0F5YgYIMh6Kiv7SdAlFQ4c1rojmgVXXguJvxR/dBUpKgY/xu9d",
	"3/bVaIc6qQOcAxNS+oHTkIdamGdTtYH6PLwaDrsvnpVJAs4tyizbBJxtxN8Mfz/ZI9qrcM9LxtpgCjak",
	"HL4oh44ZXTUUarI+olevni6i9yJT0iMz+JJA9fM24r9VGXyaIGYmB0yJ+2vKy9qa0CJcmefCbmq6alaP",
	"BhRL57cUP1z4LRk35M+VjpuWvgQff5vO54DjQr1/2XxNOS8kK3JAsATeaQYp+BoRE80chQrhOBbGnSKr",
	"zyXYTb22jOpJ2CSqNVP75unxbv147XNaLUlHu7ztV89Jan/wtdpT/H+oiRrLcmOhfplXRqXOJ6ThddXX",
	"WMMCJizQoCeR/ESqCEPQc3R//H24pVrW2vAnD0sjvg/Tefs1IpmEiX6EVqZntDrRUNlNGAtoFayg5i0N",
	"roa2sMNuMviUXH1kAFXtumLlm6ejwYVpj4u1wrRaQ6dn/x9OOtDyRVip95eWwyUkV3pvZf1By8jhx0VP",
	"IsIxkZpC/7aNpAZxlEu3t548k+zEJDtyG3heBH5sc33eAU4lhe4C3Px4SJwrb8OuJ7Mb+qp0DT/C7S7X",
	"rqxaEdV8w1UOK630QVRi295u/w0AAP//saEb97MYAAA=",
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
