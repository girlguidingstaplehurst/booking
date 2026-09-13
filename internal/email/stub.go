package email

import (
	"context"
	"io"
	"sync"

	"github.com/girlguidingstaplehurst/booking/internal/rest"
)

var _ rest.EmailSender = (*StubSender)(nil)

type RecordedAttachment struct {
	Filename string
	Mimetype string
	Content  []byte
}

type RecordedMessage struct {
	To          string
	Subject     string
	Body        string
	Attachments []RecordedAttachment
}

// StubSender records messages without contacting an external mail service.
type StubSender struct {
	mu       sync.Mutex
	messages []RecordedMessage
}

func NewStubSender() *StubSender {
	return &StubSender{}
}

func (s *StubSender) Send(ctx context.Context, to, subject, body string, attachments ...rest.EmailAttachment) error {
	return s.SendWithAttachments(ctx, to, subject, body, attachments...)
}

func (s *StubSender) SendWithAttachments(_ context.Context, to, subject, body string, attachments ...rest.EmailAttachment) error {
	recordedAttachments := make([]RecordedAttachment, 0, len(attachments))
	for _, attachment := range attachments {
		content, err := io.ReadAll(attachment.Content)
		if err != nil {
			return err
		}
		recordedAttachments = append(recordedAttachments, RecordedAttachment{
			Filename: attachment.Filename,
			Mimetype: attachment.Mimetype,
			Content:  content,
		})
	}

	s.mu.Lock()
	s.messages = append(s.messages, RecordedMessage{
		To:          to,
		Subject:     subject,
		Body:        body,
		Attachments: recordedAttachments,
	})
	s.mu.Unlock()

	return nil
}

func (s *StubSender) Messages() []RecordedMessage {
	s.mu.Lock()
	defer s.mu.Unlock()

	messages := make([]RecordedMessage, len(s.messages))
	for i, message := range s.messages {
		messages[i] = RecordedMessage{
			To:          message.To,
			Subject:     message.Subject,
			Body:        message.Body,
			Attachments: make([]RecordedAttachment, len(message.Attachments)),
		}
		for j, attachment := range message.Attachments {
			messages[i].Attachments[j] = RecordedAttachment{
				Filename: attachment.Filename,
				Mimetype: attachment.Mimetype,
				Content:  append([]byte(nil), attachment.Content...),
			}
		}
	}
	return messages
}

func (s *StubSender) Reset() {
	s.mu.Lock()
	s.messages = nil
	s.mu.Unlock()
}
