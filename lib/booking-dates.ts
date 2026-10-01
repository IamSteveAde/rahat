export function toUtcDate(value: string) {
  const date = new Date(
    `${value}T00:00:00.000Z`,
  );

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date.");
  }

  return date;
}

export function assertDateRange(
  checkIn: string,
  checkOut: string,
) {
  const start = toUtcDate(checkIn);
  const end = toUtcDate(checkOut);

  if (start >= end) {
    throw new Error(
      "Check-out must be after check-in.",
    );
  }

  const today = new Date();

  const todayUtc = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
    ),
  );

  if (start < todayUtc) {
    throw new Error(
      "Check-in cannot be in the past.",
    );
  }

  return {
    start,
    end,
  };
}

