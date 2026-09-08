alter table booking_rates
    add per_session jsonb not null default '{}';
