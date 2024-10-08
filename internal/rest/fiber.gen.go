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

type GetApiV1AdminEvents200JSONResponse EventList

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

	"H4sIAAAAAAAC/+xW32/bNhD+Vwhuj6rlJt3D9OYiXpChSIM464AVRkCLZ4udRKrkya4R6H8fjpQsO5JR",
	"dwiMreiTLfF4P7/vOz3x1BSl0aDR8eSJuzSDQvi/U2uNvQdXGu2AXpTWlGBRgT8GOn4swDmx8se4LYEn",
	"3KFVesXrOuIWPlfKguTJx2fm86g1N4tPkCKvIz5dg8Z+nNRoFCkORIg4FELldLI0thDIk+ZN1DddWlMc",
	"WEqBgKqAIWMlB8NpUcDggUOBVeiKrgoqt7RmrZwyWlA2oqRnkHt1d5fRnJwXuVzk+zksjMlB6F67leRN",
	"vk3pPs4u085VtGtw286js3mn3MB8YN1iRyEU/s/PFpY84T/FHbbiBlgxOQmTrndxhLVi20dMcDyUTuek",
	"l853MOdvG+VQf25h83U2PRsjzf5RSGnBudModaRNz9JvMj/0P5Q0vMBAj06urBa5SvPt4x6FJCxFlSNP",
	"0FYQ9Rj17yc2MKxe/H4HhuC/R8/BCw7SyirczohdoV9CFko/igozelqAsGB/a0v4/c8HQo63plr9aVdP",
	"hljymhwrvTShRy61qkRlNE/4w/ur9zziuUqh2Qmh4fz69g82WS7BGnZ9945djsY84pXNG58uiePNZjNa",
	"6Wpk7CpuHLhYrMr81eVoPAI9yrDIfdcV0nz4W2P+VnrFZluHULDJ3Q3JFlgXcnk9Go/GZG9K0KJUPOHk",
	"6JKaLTDzvYhFqeL161hI+aqDlwkydljaREommIYN84YMDcMMWCpy0FJQjwiUgqxvZLCfNhOiqYHDt0Zu",
	"W4o1oURZ5ir1l+JPjuK0G/ZrMrljsJ/GYarTNsEFMCElSL6PHAKzh1JY3L4PF+Nxv+JZlabg3LLK823j",
	"p474m/GvL1bE4RfEQCUTbTAD27QcviiHjhnNMFOOEd18RhcX58vog8iV9J4ZfEkhvK4j/kvo4HmSmJkC",
	"MCPsb6gvG2sakXFVUQi7beGqWSsSKFbOryMvM3xOxh34C6Xjbk2vwOd/COdrwEmpPryekPE02BKRrCgA",
	"wZLznhhk4GdESDQLFKpJx7FG+BRZfa7AbtsFlrSa2DXqQF2HlPX0sF5oh4KGdXlyyPkwe15m9rsPqYG5",
	"/0X6aSwrjIW2KE+KQMwzIvA+SBrrAMCEBab0mvjxHyJEs/88PPc338c5jbGlhT85zor4yf/eXNXfwo9p",
	"uHMKTW6umFn6fbJbLhbQKlhDC1naWR1iYee76+DZYXp89wSlDqh8cz4Y3JrDTbFRmDHMBLKbq+8Bkydq",
	"9A95/iHP/w957n+WdC+fA+fO27D76eyBvvVdh4/mdh9rd1atCWpelJXDwJUhF4Fs9bz+JwAA//9hTF3i",
	"8BIAAA==",
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
