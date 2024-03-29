// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.33.0
// 	protoc        (unknown)
// source: api/v1/calendar.proto

package v1

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	timestamppb "google.golang.org/protobuf/types/known/timestamppb"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type EventPrivacy int32

const (
	EventPrivacy_EVENT_PRIVACY_UNSPECIFIED EventPrivacy = 0
	EventPrivacy_EVENT_PRIVACY_PRIVATE     EventPrivacy = 1
	EventPrivacy_EVENT_PRIVACY_PUBLIC      EventPrivacy = 2
)

// Enum value maps for EventPrivacy.
var (
	EventPrivacy_name = map[int32]string{
		0: "EVENT_PRIVACY_UNSPECIFIED",
		1: "EVENT_PRIVACY_PRIVATE",
		2: "EVENT_PRIVACY_PUBLIC",
	}
	EventPrivacy_value = map[string]int32{
		"EVENT_PRIVACY_UNSPECIFIED": 0,
		"EVENT_PRIVACY_PRIVATE":     1,
		"EVENT_PRIVACY_PUBLIC":      2,
	}
)

func (x EventPrivacy) Enum() *EventPrivacy {
	p := new(EventPrivacy)
	*p = x
	return p
}

func (x EventPrivacy) String() string {
	return protoimpl.X.EnumStringOf(x.Descriptor(), protoreflect.EnumNumber(x))
}

func (EventPrivacy) Descriptor() protoreflect.EnumDescriptor {
	return file_api_v1_calendar_proto_enumTypes[0].Descriptor()
}

func (EventPrivacy) Type() protoreflect.EnumType {
	return &file_api_v1_calendar_proto_enumTypes[0]
}

func (x EventPrivacy) Number() protoreflect.EnumNumber {
	return protoreflect.EnumNumber(x)
}

// Deprecated: Use EventPrivacy.Descriptor instead.
func (EventPrivacy) EnumDescriptor() ([]byte, []int) {
	return file_api_v1_calendar_proto_rawDescGZIP(), []int{0}
}

type Booking struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Id           string                 `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"`
	Title        string                 `protobuf:"bytes,2,opt,name=title,proto3" json:"title,omitempty"`
	StartTime    *timestamppb.Timestamp `protobuf:"bytes,3,opt,name=start_time,json=startTime,proto3" json:"start_time,omitempty"`
	EndTime      *timestamppb.Timestamp `protobuf:"bytes,4,opt,name=end_time,json=endTime,proto3" json:"end_time,omitempty"`
	EventPrivacy EventPrivacy           `protobuf:"varint,5,opt,name=event_privacy,json=eventPrivacy,proto3,enum=api.v1.EventPrivacy" json:"event_privacy,omitempty"`
	CustomerId   string                 `protobuf:"bytes,6,opt,name=customer_id,json=customerId,proto3" json:"customer_id,omitempty"`
}

func (x *Booking) Reset() {
	*x = Booking{}
	if protoimpl.UnsafeEnabled {
		mi := &file_api_v1_calendar_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Booking) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Booking) ProtoMessage() {}

func (x *Booking) ProtoReflect() protoreflect.Message {
	mi := &file_api_v1_calendar_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Booking.ProtoReflect.Descriptor instead.
func (*Booking) Descriptor() ([]byte, []int) {
	return file_api_v1_calendar_proto_rawDescGZIP(), []int{0}
}

func (x *Booking) GetId() string {
	if x != nil {
		return x.Id
	}
	return ""
}

func (x *Booking) GetTitle() string {
	if x != nil {
		return x.Title
	}
	return ""
}

func (x *Booking) GetStartTime() *timestamppb.Timestamp {
	if x != nil {
		return x.StartTime
	}
	return nil
}

func (x *Booking) GetEndTime() *timestamppb.Timestamp {
	if x != nil {
		return x.EndTime
	}
	return nil
}

func (x *Booking) GetEventPrivacy() EventPrivacy {
	if x != nil {
		return x.EventPrivacy
	}
	return EventPrivacy_EVENT_PRIVACY_UNSPECIFIED
}

func (x *Booking) GetCustomerId() string {
	if x != nil {
		return x.CustomerId
	}
	return ""
}

type ListBookingsRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	StartTime *timestamppb.Timestamp `protobuf:"bytes,1,opt,name=start_time,json=startTime,proto3" json:"start_time,omitempty"`
	EndTime   *timestamppb.Timestamp `protobuf:"bytes,2,opt,name=end_time,json=endTime,proto3" json:"end_time,omitempty"`
}

func (x *ListBookingsRequest) Reset() {
	*x = ListBookingsRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_api_v1_calendar_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ListBookingsRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ListBookingsRequest) ProtoMessage() {}

func (x *ListBookingsRequest) ProtoReflect() protoreflect.Message {
	mi := &file_api_v1_calendar_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ListBookingsRequest.ProtoReflect.Descriptor instead.
func (*ListBookingsRequest) Descriptor() ([]byte, []int) {
	return file_api_v1_calendar_proto_rawDescGZIP(), []int{1}
}

func (x *ListBookingsRequest) GetStartTime() *timestamppb.Timestamp {
	if x != nil {
		return x.StartTime
	}
	return nil
}

func (x *ListBookingsRequest) GetEndTime() *timestamppb.Timestamp {
	if x != nil {
		return x.EndTime
	}
	return nil
}

type ListBookingsResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Bookings []*Booking `protobuf:"bytes,1,rep,name=bookings,proto3" json:"bookings,omitempty"`
}

func (x *ListBookingsResponse) Reset() {
	*x = ListBookingsResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_api_v1_calendar_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ListBookingsResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ListBookingsResponse) ProtoMessage() {}

func (x *ListBookingsResponse) ProtoReflect() protoreflect.Message {
	mi := &file_api_v1_calendar_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ListBookingsResponse.ProtoReflect.Descriptor instead.
func (*ListBookingsResponse) Descriptor() ([]byte, []int) {
	return file_api_v1_calendar_proto_rawDescGZIP(), []int{2}
}

func (x *ListBookingsResponse) GetBookings() []*Booking {
	if x != nil {
		return x.Bookings
	}
	return nil
}

var File_api_v1_calendar_proto protoreflect.FileDescriptor

var file_api_v1_calendar_proto_rawDesc = []byte{
	0x0a, 0x15, 0x61, 0x70, 0x69, 0x2f, 0x76, 0x31, 0x2f, 0x63, 0x61, 0x6c, 0x65, 0x6e, 0x64, 0x61,
	0x72, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12, 0x06, 0x61, 0x70, 0x69, 0x2e, 0x76, 0x31, 0x1a,
	0x1f, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x2f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x62, 0x75, 0x66,
	0x2f, 0x74, 0x69, 0x6d, 0x65, 0x73, 0x74, 0x61, 0x6d, 0x70, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f,
	0x22, 0xfd, 0x01, 0x0a, 0x07, 0x42, 0x6f, 0x6f, 0x6b, 0x69, 0x6e, 0x67, 0x12, 0x0e, 0x0a, 0x02,
	0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x02, 0x69, 0x64, 0x12, 0x14, 0x0a, 0x05,
	0x74, 0x69, 0x74, 0x6c, 0x65, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x05, 0x74, 0x69, 0x74,
	0x6c, 0x65, 0x12, 0x39, 0x0a, 0x0a, 0x73, 0x74, 0x61, 0x72, 0x74, 0x5f, 0x74, 0x69, 0x6d, 0x65,
	0x18, 0x03, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x1a, 0x2e, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x2e,
	0x70, 0x72, 0x6f, 0x74, 0x6f, 0x62, 0x75, 0x66, 0x2e, 0x54, 0x69, 0x6d, 0x65, 0x73, 0x74, 0x61,
	0x6d, 0x70, 0x52, 0x09, 0x73, 0x74, 0x61, 0x72, 0x74, 0x54, 0x69, 0x6d, 0x65, 0x12, 0x35, 0x0a,
	0x08, 0x65, 0x6e, 0x64, 0x5f, 0x74, 0x69, 0x6d, 0x65, 0x18, 0x04, 0x20, 0x01, 0x28, 0x0b, 0x32,
	0x1a, 0x2e, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x62, 0x75,
	0x66, 0x2e, 0x54, 0x69, 0x6d, 0x65, 0x73, 0x74, 0x61, 0x6d, 0x70, 0x52, 0x07, 0x65, 0x6e, 0x64,
	0x54, 0x69, 0x6d, 0x65, 0x12, 0x39, 0x0a, 0x0d, 0x65, 0x76, 0x65, 0x6e, 0x74, 0x5f, 0x70, 0x72,
	0x69, 0x76, 0x61, 0x63, 0x79, 0x18, 0x05, 0x20, 0x01, 0x28, 0x0e, 0x32, 0x14, 0x2e, 0x61, 0x70,
	0x69, 0x2e, 0x76, 0x31, 0x2e, 0x45, 0x76, 0x65, 0x6e, 0x74, 0x50, 0x72, 0x69, 0x76, 0x61, 0x63,
	0x79, 0x52, 0x0c, 0x65, 0x76, 0x65, 0x6e, 0x74, 0x50, 0x72, 0x69, 0x76, 0x61, 0x63, 0x79, 0x12,
	0x1f, 0x0a, 0x0b, 0x63, 0x75, 0x73, 0x74, 0x6f, 0x6d, 0x65, 0x72, 0x5f, 0x69, 0x64, 0x18, 0x06,
	0x20, 0x01, 0x28, 0x09, 0x52, 0x0a, 0x63, 0x75, 0x73, 0x74, 0x6f, 0x6d, 0x65, 0x72, 0x49, 0x64,
	0x22, 0x87, 0x01, 0x0a, 0x13, 0x4c, 0x69, 0x73, 0x74, 0x42, 0x6f, 0x6f, 0x6b, 0x69, 0x6e, 0x67,
	0x73, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x39, 0x0a, 0x0a, 0x73, 0x74, 0x61, 0x72,
	0x74, 0x5f, 0x74, 0x69, 0x6d, 0x65, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x1a, 0x2e, 0x67,
	0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x62, 0x75, 0x66, 0x2e, 0x54,
	0x69, 0x6d, 0x65, 0x73, 0x74, 0x61, 0x6d, 0x70, 0x52, 0x09, 0x73, 0x74, 0x61, 0x72, 0x74, 0x54,
	0x69, 0x6d, 0x65, 0x12, 0x35, 0x0a, 0x08, 0x65, 0x6e, 0x64, 0x5f, 0x74, 0x69, 0x6d, 0x65, 0x18,
	0x02, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x1a, 0x2e, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x2e, 0x70,
	0x72, 0x6f, 0x74, 0x6f, 0x62, 0x75, 0x66, 0x2e, 0x54, 0x69, 0x6d, 0x65, 0x73, 0x74, 0x61, 0x6d,
	0x70, 0x52, 0x07, 0x65, 0x6e, 0x64, 0x54, 0x69, 0x6d, 0x65, 0x22, 0x43, 0x0a, 0x14, 0x4c, 0x69,
	0x73, 0x74, 0x42, 0x6f, 0x6f, 0x6b, 0x69, 0x6e, 0x67, 0x73, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e,
	0x73, 0x65, 0x12, 0x2b, 0x0a, 0x08, 0x62, 0x6f, 0x6f, 0x6b, 0x69, 0x6e, 0x67, 0x73, 0x18, 0x01,
	0x20, 0x03, 0x28, 0x0b, 0x32, 0x0f, 0x2e, 0x61, 0x70, 0x69, 0x2e, 0x76, 0x31, 0x2e, 0x42, 0x6f,
	0x6f, 0x6b, 0x69, 0x6e, 0x67, 0x52, 0x08, 0x62, 0x6f, 0x6f, 0x6b, 0x69, 0x6e, 0x67, 0x73, 0x2a,
	0x62, 0x0a, 0x0c, 0x45, 0x76, 0x65, 0x6e, 0x74, 0x50, 0x72, 0x69, 0x76, 0x61, 0x63, 0x79, 0x12,
	0x1d, 0x0a, 0x19, 0x45, 0x56, 0x45, 0x4e, 0x54, 0x5f, 0x50, 0x52, 0x49, 0x56, 0x41, 0x43, 0x59,
	0x5f, 0x55, 0x4e, 0x53, 0x50, 0x45, 0x43, 0x49, 0x46, 0x49, 0x45, 0x44, 0x10, 0x00, 0x12, 0x19,
	0x0a, 0x15, 0x45, 0x56, 0x45, 0x4e, 0x54, 0x5f, 0x50, 0x52, 0x49, 0x56, 0x41, 0x43, 0x59, 0x5f,
	0x50, 0x52, 0x49, 0x56, 0x41, 0x54, 0x45, 0x10, 0x01, 0x12, 0x18, 0x0a, 0x14, 0x45, 0x56, 0x45,
	0x4e, 0x54, 0x5f, 0x50, 0x52, 0x49, 0x56, 0x41, 0x43, 0x59, 0x5f, 0x50, 0x55, 0x42, 0x4c, 0x49,
	0x43, 0x10, 0x02, 0x32, 0x5e, 0x0a, 0x0f, 0x42, 0x6f, 0x6f, 0x6b, 0x69, 0x6e, 0x67, 0x73, 0x53,
	0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x12, 0x4b, 0x0a, 0x0c, 0x4c, 0x69, 0x73, 0x74, 0x42, 0x6f,
	0x6f, 0x6b, 0x69, 0x6e, 0x67, 0x73, 0x12, 0x1b, 0x2e, 0x61, 0x70, 0x69, 0x2e, 0x76, 0x31, 0x2e,
	0x4c, 0x69, 0x73, 0x74, 0x42, 0x6f, 0x6f, 0x6b, 0x69, 0x6e, 0x67, 0x73, 0x52, 0x65, 0x71, 0x75,
	0x65, 0x73, 0x74, 0x1a, 0x1c, 0x2e, 0x61, 0x70, 0x69, 0x2e, 0x76, 0x31, 0x2e, 0x4c, 0x69, 0x73,
	0x74, 0x42, 0x6f, 0x6f, 0x6b, 0x69, 0x6e, 0x67, 0x73, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73,
	0x65, 0x22, 0x00, 0x42, 0x36, 0x5a, 0x34, 0x67, 0x69, 0x74, 0x68, 0x75, 0x62, 0x2e, 0x63, 0x6f,
	0x6d, 0x2f, 0x67, 0x69, 0x72, 0x6c, 0x67, 0x75, 0x69, 0x64, 0x69, 0x6e, 0x67, 0x73, 0x74, 0x61,
	0x70, 0x6c, 0x65, 0x68, 0x75, 0x72, 0x73, 0x74, 0x2f, 0x62, 0x6f, 0x6f, 0x6b, 0x69, 0x6e, 0x67,
	0x2f, 0x70, 0x6b, 0x67, 0x2f, 0x61, 0x70, 0x69, 0x2f, 0x76, 0x31, 0x62, 0x06, 0x70, 0x72, 0x6f,
	0x74, 0x6f, 0x33,
}

var (
	file_api_v1_calendar_proto_rawDescOnce sync.Once
	file_api_v1_calendar_proto_rawDescData = file_api_v1_calendar_proto_rawDesc
)

func file_api_v1_calendar_proto_rawDescGZIP() []byte {
	file_api_v1_calendar_proto_rawDescOnce.Do(func() {
		file_api_v1_calendar_proto_rawDescData = protoimpl.X.CompressGZIP(file_api_v1_calendar_proto_rawDescData)
	})
	return file_api_v1_calendar_proto_rawDescData
}

var file_api_v1_calendar_proto_enumTypes = make([]protoimpl.EnumInfo, 1)
var file_api_v1_calendar_proto_msgTypes = make([]protoimpl.MessageInfo, 3)
var file_api_v1_calendar_proto_goTypes = []interface{}{
	(EventPrivacy)(0),             // 0: api.v1.EventPrivacy
	(*Booking)(nil),               // 1: api.v1.Booking
	(*ListBookingsRequest)(nil),   // 2: api.v1.ListBookingsRequest
	(*ListBookingsResponse)(nil),  // 3: api.v1.ListBookingsResponse
	(*timestamppb.Timestamp)(nil), // 4: google.protobuf.Timestamp
}
var file_api_v1_calendar_proto_depIdxs = []int32{
	4, // 0: api.v1.Booking.start_time:type_name -> google.protobuf.Timestamp
	4, // 1: api.v1.Booking.end_time:type_name -> google.protobuf.Timestamp
	0, // 2: api.v1.Booking.event_privacy:type_name -> api.v1.EventPrivacy
	4, // 3: api.v1.ListBookingsRequest.start_time:type_name -> google.protobuf.Timestamp
	4, // 4: api.v1.ListBookingsRequest.end_time:type_name -> google.protobuf.Timestamp
	1, // 5: api.v1.ListBookingsResponse.bookings:type_name -> api.v1.Booking
	2, // 6: api.v1.BookingsService.ListBookings:input_type -> api.v1.ListBookingsRequest
	3, // 7: api.v1.BookingsService.ListBookings:output_type -> api.v1.ListBookingsResponse
	7, // [7:8] is the sub-list for method output_type
	6, // [6:7] is the sub-list for method input_type
	6, // [6:6] is the sub-list for extension type_name
	6, // [6:6] is the sub-list for extension extendee
	0, // [0:6] is the sub-list for field type_name
}

func init() { file_api_v1_calendar_proto_init() }
func file_api_v1_calendar_proto_init() {
	if File_api_v1_calendar_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_api_v1_calendar_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Booking); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_api_v1_calendar_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*ListBookingsRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_api_v1_calendar_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*ListBookingsResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_api_v1_calendar_proto_rawDesc,
			NumEnums:      1,
			NumMessages:   3,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_api_v1_calendar_proto_goTypes,
		DependencyIndexes: file_api_v1_calendar_proto_depIdxs,
		EnumInfos:         file_api_v1_calendar_proto_enumTypes,
		MessageInfos:      file_api_v1_calendar_proto_msgTypes,
	}.Build()
	File_api_v1_calendar_proto = out.File
	file_api_v1_calendar_proto_rawDesc = nil
	file_api_v1_calendar_proto_goTypes = nil
	file_api_v1_calendar_proto_depIdxs = nil
}
