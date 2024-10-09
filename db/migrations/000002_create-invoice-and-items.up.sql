create table if not exists booking_invoices
(
    id   text primary key,
    sent timestamp not null,
    paid timestamp
);

create table if not exists booking_invoice_items
(
    id            text primary key,
    invoice_id    text not null,
    event_id      text,
    description   text,
    cost          money,

    fk_invoice_id text references booking_invoices (id),
    fk_event_id   text references booking_events (id)
);

create table if not exists booking_rates
(
    id             text primary key,
    description    text  not null,
    hourly_rate    money not null,
    discount_table jsonb not null
);

alter table booking_events add rate_id text references booking_rates(id);