create table booking_event_notes
(
    id          text primary key,
    event_id    text                     not null references booking_events (id),
    content     text                     not null,
    author_email text                    not null,
    created_at  timestamp with time zone not null default now()
);

create index booking_event_notes_event_created
    on booking_event_notes (event_id, created_at desc, id desc);
