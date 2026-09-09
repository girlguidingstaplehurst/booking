alter table booking_invoice_items
    add event_id text,
    add fk_invoice_id text,
    add fk_event_id text;

alter table booking_invoices
    drop column event_id,
    drop column event_group_id;
