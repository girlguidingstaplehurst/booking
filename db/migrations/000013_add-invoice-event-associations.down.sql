alter table booking_invoices
    add event_id text references booking_events;

update booking_invoices invoice
set event_id = associations.event_id
from (
    select invoice_id, min(event_id) as event_id
    from booking_invoice_events
    group by invoice_id
) associations
where invoice.id = associations.invoice_id;

drop table booking_invoice_events;
