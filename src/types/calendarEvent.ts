export interface CalendarEventFormat {
  id: string;
  title: string;
  start: string;
  end: string;
}

export type UnavailableTime = {
  start: string;
  end: string;
};

export type EventConfig = {
  title?: string;
  display?: string;
  color?: string;
  overlap?: boolean;
};

export type CalendarEvent = UnavailableTime & Required<EventConfig>;
