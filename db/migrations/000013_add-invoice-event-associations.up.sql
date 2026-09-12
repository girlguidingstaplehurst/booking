create table booking_invoice_events
(
    invoice_id text not null references booking_invoices (id) on delete cascade,
    event_id   text not null references booking_events (id),
    primary key (invoice_id, event_id)
);

insert into booking_invoice_events (invoice_id, event_id)
select id, event_id
from booking_invoices
where event_id is not null;

alter table booking_invoices
    drop column event_id;
