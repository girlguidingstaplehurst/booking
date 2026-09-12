import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export const CLEANING_DEPOSIT = 100;

export function discountForDuration(hours, discountTable = {}) {
  return Object.entries(discountTable).reduce((discount, [threshold, value]) => {
    const amount = typeof value === "object" ? value.value : value;
    if (hours >= Number(threshold) && amount > discount) {
      return -amount;
    }
    return discount;
  }, 0);
}

function eventDuration(event) {
  return dayjs.duration(dayjs(event.to).diff(event.from)).asHours();
}

function sessionDescription(event) {
  const start = dayjs(event.from).format("ddd D MMM YYYY h:mm A");
  const end = dayjs(event.to).format("h:mm A");
  return `${event.name} - ${start} to ${end}`;
}

function hourlyItems(events) {
  return events.reduce((items, event) => {
    const hours = eventDuration(event);
    const description = `${sessionDescription(event)} (${hours.toFixed(1)} hours)`;
    items.push({
      eventID: event.id,
      description,
      cost: hours * event.rate,
    });

    const discount = discountForDuration(hours, event.discountTable);
    if (discount < 0) {
      items.push({
        eventID: event.id,
        description: `${event.name} - Discount`,
        cost: discount,
      });
    }
    return items;
  }, []);
}

export function populateInvoiceItems(preparation, includeDeposit = false) {
  const events = preparation.events || [];
  let items;

  if (preparation.mode === "group" && preparation.rate?.perSession?.length) {
    const [firstTier, additionalTier] = preparation.rate.perSession;
    const sessionCount = events.length;
    const additionalSessions = Math.max(sessionCount - firstTier.count, 0);
    items = [
      {
        description: `Event hire - first ${Math.min(sessionCount, firstTier.count)} sessions`,
        cost: firstTier.price,
      },
    ];
    if (additionalSessions > 0) {
      items.push({
        description: `Event hire - ${additionalSessions} additional sessions`,
        cost: additionalSessions * additionalTier.price,
      });
    }
  } else {
    items = hourlyItems(events);
  }

  if (preparation.mode === "individual" && includeDeposit) {
    items.push({
      description: "Refundable Cleaning and Damage deposit",
      cost: CLEANING_DEPOSIT,
    });
  }

  return items;
}
